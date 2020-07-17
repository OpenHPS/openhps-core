const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = [{
    mode: 'development',
    entry: './dist/index.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.bundle.js'
    },
    externals: {
        './node_modules/mathjs': 'mathjs',
    }
},{
    mode: 'production',
    entry: './dist/index.js',
    devtool: 'source-map',
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
    externals: {
        mathjs: 'mathjs',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.bundle.min.js'
    }
}];