const shell = require('shelljs');
const path = require('path');
const babel = require('@babel/core');
const fs = require('fs');

const build_dir = "../node_modules/three-cjs/";

// Delete the three directory
shell.rm("-rf", path.join(__dirname, build_dir))

// Create three directory
shell.mkdir(path.join(__dirname, build_dir));

// Copy three javascript files
shell.cp("-r",
    path.join(__dirname, "../node_modules/three/src/*"),
    path.join(__dirname, build_dir)
);

// Copy three type definitions
shell.cp("-r",
    path.join(__dirname, "../node_modules/@types/three/src/*"),
    path.join(__dirname, build_dir),
);

// Transpile three to CJS
const directory = path.join(__dirname, build_dir);
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
