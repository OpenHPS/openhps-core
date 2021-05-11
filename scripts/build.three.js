const shell = require('shelljs');
const path = require('path');
const babel = require('@babel/core');
const fs = require('fs');

const three_dir = path.join(path.dirname(require.resolve('three')), "../");
const build_dir = path.join(__dirname, "../src/utils/math/three");
console.log("Three dir: ", three_dir);
console.log("Build dir: ", build_dir);

// Delete the three directory
shell.rm("-rf", build_dir);

// Create three directory
shell.mkdir(build_dir);

// Copy three javascript files
shell.cp("-r",
    path.join(three_dir, "src/*"),
    build_dir
);

// Copy three type definitions
shell.cp("-r",
    "node_modules/@types/three/src/*",
    build_dir,
);

// Transpile three to CJS
const directory = build_dir;
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
                presets: ["@babel/preset-env"]
            });
            fs.writeFileSync(file, result.code);
        }
    });
}
transform(directory);
