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
        filename: 'openhps-core.js'
    },
    plugins: [
        new ThreadsPlugin({
          globalObject: false
        }),
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
      "mathjs": 'mathjs',
      "tiny-worker": "tiny-worker"
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
    resolve: {
      alias: {
        'typedjson': 'typedjson/js/typedjson.min.js',
        'jsonpath-plus': 'jsonpath-plus/dist/index-es.min.js'
      }
    },
    externals: {
        "mathjs": 'mathjs',
        "tiny-worker": "tiny-worker"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openhps-core.min.js'
    }
}];