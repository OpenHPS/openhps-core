/**
 * Post-process dist/esm into output Node can actually load as ESM.
 *
 * Two problems are fixed here, both of which made the "import" condition of the
 * exports map unusable outside a bundler:
 *
 * 1. typedjson deep imports. src/data/{Serializer,Deserializer,types}.ts reach into
 *    typedjson internals (`typedjson/lib/cjs/...`) because typedjson exposes no
 *    public API for them, and tsc emits those specifiers without an extension.
 *
 *    The removed babel step rewrote these to `typedjson/lib/esm/`. That is wrong
 *    for Node: typedjson declares no "type": "module" and its ESM build uses
 *    extensionless internal imports, so `typedjson/lib/esm/deserializer.js` cannot
 *    be loaded from an ES module at all. Its CommonJS build *can* — Node's
 *    cjs-module-lexer picks up the named exports. So the extension is added and
 *    the path deliberately stays on lib/cjs. (`typedjson/lib/types/*` imports are
 *    type-only and erased at compile time, so they need no rewrite.)
 *
 * 2. Directory and extensionless relative specifiers. TypeScript emits
 *    `export * from './graph'` verbatim under module: es2020. Bundlers resolve
 *    that; Node's ESM resolver does not, and fails with
 *    ERR_UNSUPPORTED_DIR_IMPORT. Every relative specifier is rewritten to a real
 *    file path.
 *
 * It also writes the per-directory "type" markers, without which Node reads
 * dist/esm/*.js as CommonJS and dies on the first `import` statement.
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Bare-package deep specifiers that tsc emits without an extension. */
const BARE_DEEP = /^typedjson\/lib\/cjs\/[^'"]+$/;

const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist');
const esm = join(dist, 'esm');

/** Matches the specifier of a static import/export, or a dynamic import(). */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g;

/**
 * Resolve a relative specifier to something Node's ESM resolver accepts.
 * @param {string} fileDir Directory of the importing file
 * @param {string} spec Relative specifier as emitted by tsc
 * @returns {string} The specifier, with an explicit file path where one was missing
 */
function resolveSpecifier(fileDir, spec) {
    // Already explicit — leave alone (three's own sources are extensioned).
    if (/\.(js|mjs|cjs|json|node)$/.test(spec)) return spec;
    // typedjson's internals are reached by a bare deep path; Node needs the extension.
    if (BARE_DEEP.test(spec)) return `${spec}.js`;
    // Any other bare specifier is a package entry point — leave it to the resolver.
    if (!spec.startsWith('./') && !spec.startsWith('../')) return spec;
    const target = resolve(fileDir, spec);
    if (existsSync(`${target}.js`)) return `${spec}.js`;
    if (existsSync(join(target, 'index.js'))) return `${spec.replace(/\/$/, '')}/index.js`;
    // Unresolvable: leave it untouched rather than emit a path that does not exist,
    // so the failure stays visible instead of turning into a confusing 404.
    return spec;
}

let specifiersPatched = 0;

(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
            walk(p);
            continue;
        }
        if (!p.endsWith('.js')) continue;

        const original = readFileSync(p, 'utf8');
        let out = original;
        const fileDir = dirname(p);
        let rewrites = 0;
        out = out.replace(SPECIFIER, (match, prefix, quote, spec) => {
            const fixed = resolveSpecifier(fileDir, spec);
            if (fixed === spec) return match;
            rewrites++;
            return `${prefix}${quote}${fixed}${quote}`;
        });
        if (rewrites > 0) specifiersPatched++;

        if (out !== original) writeFileSync(p, out);
    }
})(esm);

// build:ts:cjs runs in parallel with build:ts:esm, so dist/cjs may not exist yet.
mkdirSync(join(dist, 'cjs'), { recursive: true });
writeFileSync(join(esm, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 4)}\n`);
writeFileSync(join(dist, 'cjs', 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 4)}\n`);

console.log(
    `fix-esm-imports: specifiers made explicit in ${specifiersPatched} file(s), type markers written`,
);
