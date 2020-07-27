const TerserPlugin = require('terser-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');
const path = require('path');

module.exports = [{
    mode: 'development',
    entry: './dist/index.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.js'
    },
    plugins: [
        new WebpackAutoInject({
            SHORT: '@openhps/core',
            components: {
              AutoIncreaseVersion: false,
            },
            componentsOptions: {
              InjectAsComment: {
                tag: 'Version: {version} - {date}',
                dateFormat: 'isoDate',
              },
            },
        }),
    ],
    externals: {
        mathjs: 'mathjs',
    },
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
    plugins: [
        new WebpackAutoInject({
            SHORT: '@openhps/core',
            components: {
              AutoIncreaseVersion: false,
            },
            componentsOptions: {
              InjectAsComment: {
                tag: 'Version: {version} - {date}',
                dateFormat: 'isoDate',
              },
            },
        }),
    ],
    externals: {
        mathjs: 'mathjs',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.min.js'
    }
}];