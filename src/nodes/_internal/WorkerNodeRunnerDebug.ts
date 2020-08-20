// eslint-disable-next-line
require("@babel/register")({
    presets: ['@babel/preset-env'],
    plugins: [['@babel/plugin-transform-runtime']],
    only: ['node_modules/three/src/**/*.js'],
    cache: true,
});
require('./WorkerNodeRunner');
