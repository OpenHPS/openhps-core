/**
 * Vendor THREE.js into the build as CommonJS and ESM.
 *   Reason: tree shaking the three.js npm module is not possible, so only the
 *   handful of math classes this package actually uses are copied in.
 *
 * Uses only node: builtins. It previously required `shelljs`, which was never a
 * declared dependency and only resolved by hoisting — one dependency-tree change
 * away from breaking `npm run build` at its very first step.
 */
const path = require('node:path');
const fs = require('node:fs');
const babel = require('@babel/core');

const threeDir = path.join(path.dirname(require.resolve('three')), '..');
const threeTypesDir = path.join(path.dirname(require.resolve('@types/three/package.json')), 'src');

const srcDir = path.join(__dirname, '../src/three');
const cjsDir = path.join(__dirname, '../dist/cjs/three');
const esmDir = path.join(__dirname, '../dist/esm/three');
const typesDir = path.join(__dirname, '../dist/types/three');

console.log('Three dir:  ', threeDir);
console.log('Types dir:  ', threeTypesDir);
console.log('Source dir: ', srcDir);
console.log('CJS dir:    ', cjsDir);
console.log('ESM dir:    ', esmDir);

for (const dir of [srcDir, esmDir, cjsDir, typesDir]) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

// three ships its sources as ESM, so src/ and dist/esm/ take them verbatim.
for (const dir of [srcDir, esmDir]) {
    fs.cpSync(path.join(threeDir, 'src'), dir, { recursive: true });
}

fs.cpSync(threeTypesDir, typesDir, { recursive: true });

/**
 * Transpile every .js under a directory to CommonJS, in place.
 * @param {string} directory Directory to walk
 */
function transform(directory) {
    for (const entry of fs.readdirSync(directory)) {
        const file = path.join(directory, entry);
        if (fs.lstatSync(file).isDirectory()) {
            transform(file);
        } else if (entry.endsWith('.js')) {
            const result = babel.transformFileSync(file, {
                presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
            });
            fs.writeFileSync(file, result.code);
        }
    }
}
transform(srcDir);

fs.cpSync(srcDir, cjsDir, { recursive: true });

// Finally lay the type definitions over the sources so `src/three` type-checks.
fs.cpSync(threeTypesDir, srcDir, { recursive: true });
