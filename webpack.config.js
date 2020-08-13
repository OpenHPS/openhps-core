const TerserPlugin = require('terser-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');
const ThreadsPlugin = require('threads-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = [
{
  mode: 'development',
  entry: './dist/index.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'openhps-core.js',
    library: '@openhps/core',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
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
    new webpack.DefinePlugin({

    }),
  ],
  resolve: {
    alias: {
      'typedjson': 'typedjson/js/typedjson.js',
    }
  },
  externals: [],
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
    new webpack.DefinePlugin({

    })
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }, 
  resolve: {
    alias: {
      'typedjson': 'typedjson/js/typedjson.min.js',
    }
  },
  externals: [],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'openhps-core.min.js',
    library: '@openhps/core',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  }
}];