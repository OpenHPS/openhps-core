const TerserPlugin = require('terser-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');
const ThreadsPlugin = require('threads-plugin');

const path = require('path');

module.exports = [{
    mode: 'development',
    entry: './dist/index.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.js',
        library: 'openhps-core',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    plugins: [
        // new ThreadsPlugin({
        //   globalObject: false
        // }),
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
    resolve: {
      alias: {
        'typedjson': 'typedjson/js/typedjson.min.js',
        "mathjs": "mathjs/dist/math.min.js"
      }
    },
    externals: {
      "tiny-worker": "tiny-worker",
      "decimal.js": "decimal.js",
      "fraction.js": "fraction.js",
      "complex.js": "complex.js",
      "typed-function": "typed-function"
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
        // new ThreadsPlugin({
        //   globalObject: false
        // }), 
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
    resolve: {
      alias: {
        'typedjson': 'typedjson/js/typedjson.min.js',
      }
    },
    externals: {
        "tiny-worker": "tiny-worker",
        "decimal.js": "decimal.js",
        "fraction.js": "fraction.js",
        "complex.js": "complex.js",
        "typed-function": "typed-function"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.min.js',
        library: 'openhps-core',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
    }
}];