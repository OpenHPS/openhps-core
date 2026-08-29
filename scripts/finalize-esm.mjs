/**
 * Turn tsc's `dist/esm` output into something Node and webpack can actually treat
 * as ES modules.
 *
 * Without this step the "import" condition of the exports map is unusable outside
 * a resolver that tolerates Node-illegal specifiers:
 *
 * 1. No per-directory "type" marker. The package root is "commonjs", so Node reads
 *    dist/esm/*.js as CommonJS and throws on the first `import` statement, and
 *    webpack reports "'import' and 'export' may appear only with sourceType:
 *    module". Writing dist/esm/package.json with {"type":"module"} scopes the ESM
 *    output without renaming every emitted file to .mjs.
 *
 * 2. Directory and extensionless relative specifiers. TypeScript emits
 *    `export * from './object'` verbatim under module: es2020. Bundlers resolve
 *    that; Node's ESM resolver rejects it with ERR_UNSUPPORTED_DIR_IMPORT. Every
 *    relative specifier is rewritten to a real file path.
 *
 * 3. Bare deep specifiers into CommonJS-only packages (typedjson's internals, which
 *    @openhps/core reaches into because typedjson exposes no public API for them).
 *    Node needs the explicit extension. These deliberately keep pointing at the
 *    package's CommonJS build: typedjson declares no "type": "module" and its ESM
 *    build itself uses extensionless internal imports, so lib/esm cannot be loaded
 *    from an ES module at all, whereas lib/cjs can -- cjs-module-lexer picks up the
 *    named exports.
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** CommonJS-only deep paths that tsc emits without an extension. */
const BARE_DEEP = [/^typedjson\/lib\/cjs\/[^'"]+$/];

// Defaults to the package this script lives in; a workspace child passes its own
// root, since the script itself is shared from the monorepo root.
const pkgRoot = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(pkgRoot, 'dist');
const esm = join(dist, 'esm');
const cjs = join(dist, 'cjs');

if (!existsSync(esm)) {
    console.log('finalize-esm: dist/esm not present, nothing to do');
    process.exit(0);
}

/** Matches the specifier of a static import/export, or a dynamic import(). */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g;

/**
 * Resolve a specifier to something Node's ESM resolver accepts.
 * @param {string} fileDir Directory of the importing file
 * @param {string} spec Specifier as emitted by tsc
 * @returns {string} The specifier, with an explicit file path where one was missing
 */
function resolveSpecifier(fileDir, spec) {
    // Already explicit — leave alone.
    if (/\.(js|mjs|cjs|json|node)$/.test(spec)) return spec;
    if (BARE_DEEP.some((re) => re.test(spec))) return `${spec}.js`;
    // Any other bare specifier is a package entry point; leave it to the resolver.
    if (!spec.startsWith('./') && !spec.startsWith('../')) return spec;
    const target = resolve(fileDir, spec);
    if (existsSync(`${target}.js`)) return `${spec}.js`;
    if (existsSync(join(target, 'index.js'))) return `${spec.replace(/\/$/, '')}/index.js`;
    // Unresolvable: leave it untouched so the failure stays visible rather than
    // becoming a path that silently does not exist.
    return spec;
}

let patched = 0;

(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
            walk(p);
            continue;
        }
        if (!p.endsWith('.js')) continue;

        const original = readFileSync(p, 'utf8');
        const fileDir = dirname(p);
        let rewrites = 0;
        const out = original.replace(SPECIFIER, (match, prefix, quote, spec) => {
            const fixed = resolveSpecifier(fileDir, spec);
            if (fixed === spec) return match;
            rewrites++;
            return `${prefix}${quote}${fixed}${quote}`;
        });
        if (rewrites > 0) {
            writeFileSync(p, out);
            patched++;
        }
    }
})(esm);

writeFileSync(join(esm, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 4)}\n`);
// build:ts:cjs may run in parallel with build:ts:esm, so dist/cjs may not exist yet.
mkdirSync(cjs, { recursive: true });
writeFileSync(join(cjs, 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 4)}\n`);

console.log(`finalize-esm: specifiers made explicit in ${patched} file(s), type markers written`);
