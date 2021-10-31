/**
 * Build THREE.js to CommonJS
 *  Reason: Tree shaking on three.js NPM module is not possible
 */
const shell = require('shelljs');
const path = require('path');
const babel = require('@babel/core');
const fs = require('fs');

const three_dir = path.join(path.dirname(require.resolve('three')), "../");
const src_dir = path.join(__dirname, "../src/three");
const cjs_dir = path.join(__dirname, "../lib/cjs/three");
const esm_dir = path.join(__dirname, "../lib/esm/three");
const types_dir = path.join(__dirname, "../lib/types/three");

console.log("Three dir: ", three_dir);
console.log("Source dir: ", src_dir);
console.log("CJS dir: ", cjs_dir);
console.log("ESM dir: ", esm_dir);

[src_dir, esm_dir, cjs_dir, types_dir].forEach(dir => {
    // Delete the three directory
    shell.rm("-rf", dir);
   
    // Create three directory
    shell.mkdir('-p', dir);
});

// Copy three javascript files
[src_dir, esm_dir].forEach(dir => {
    shell.cp("-r",
        path.join(three_dir, "src/*"),
        dir
    );
});

// Copy three type definitions
shell.cp("-r",
    "node_modules/@types/three/src/*",
    types_dir,
);

// Transpile three to CJS
const directory = src_dir;
function transform(directory) {
    const entries = fs.readdirSync(directory);
    entries.forEach(entry => {
        const file = path.join(directory, entry);
        const stats = fs.lstatSync(path.join(directory, entry));
        if (stats.isDirectory()) {
            transform(file);
        } else if (entry.endsWith(".js")) {
            // Transpile
            console.log(file);
            const result = babel.transformFileSync(file, {
                presets: [["@babel/preset-env", {
                    "targets": {
                        "node": "current"
                    },
                }]]
            });
            fs.writeFileSync(file, result.code);
        }
    });
}
transform(directory);

// Copy three javascript files
shell.cp("-r",
    path.join(src_dir, './*'),
    cjs_dir
);

shell.cp("-r",
    "node_modules/@types/three/src/*",
    src_dir
);
