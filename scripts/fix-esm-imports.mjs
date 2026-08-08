/**
 * Rewrite typedjson's CommonJS deep-import specifiers to their ESM twins in
 * dist/esm.
 *
 * src/data/{Serializer,Deserializer,types}.ts reach into typedjson internals
 * (`typedjson/lib/cjs/serializer`, `.../deserializer`, `.../type-descriptor`,
 * `.../helpers`, `.../options-base`) because typedjson exposes no public API for
 * them. Left alone, dist/esm would ship CommonJS files inside the ESM graph,
 * costing tree-shaking and making named-import resolution lexer-dependent.
 *
 * Replaces babel + @babel/cli + babel-plugin-replace-imports, which existed
 * solely to perform this one substitution. `typedjson/lib/types/*` imports are
 * type-only and are erased at compile time, so they need no rewrite.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FROM = 'typedjson/lib/cjs/';
const TO = 'typedjson/lib/esm/';

const root = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist', 'esm');

let patched = 0;
(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.js') || p.endsWith('.js.map')) {
            const src = readFileSync(p, 'utf8');
            if (src.includes(FROM)) {
                writeFileSync(p, src.split(FROM).join(TO));
                patched++;
            }
        }
    }
})(root);

console.log(`fix-esm-imports: rewrote typedjson CJS specifiers in ${patched} file(s)`);
