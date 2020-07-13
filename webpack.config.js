const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = [{
    mode: 'development',
    entry: './dist/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.bundle.js'
    }
},{
    mode: 'production',
    entry: './dist/index.js',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
              })
            ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.bundle.min.js'
    }
}];