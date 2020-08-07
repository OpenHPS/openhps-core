require("@babel/register")({
    presets: ["@babel/preset-env"],
    plugins: [
        ["@babel/plugin-transform-runtime"]
    ],
    only: ['node_modules/three/src/math/*.js'],
    cache: true,
});
require('./WorkerNodeRunner');
