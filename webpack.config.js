const TerserPlugin = require('terser-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');
const InjectPlugin = require('webpack-inject-plugin').default;
const path = require('path');

module.exports = [{
  name: 'openhps-core-development',
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
  ],
  resolve: {
    alias: {
      'typedjson': 'typedjson/js/typedjson.js',
    }
  },
  externals: [],
},{
  name: 'openhps-core-production',
  mode: 'production',
  entry: './dist/index.js',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ],
    portableRecords: true,
    usedExports: true,
    providedExports: true
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
},{
  name: 'openhps-core-worker-development',
  mode: 'development',
  entry: './dist/nodes/_internal/WorkerNodeRunner.js',
  devtool: 'source-map',
  externals: {'../../': '@openhps/core'},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'worker.openhps-core.js',
    library: '@openhps/core',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  plugins: [
    new InjectPlugin(function() {
      return "importScripts('openhps-core.min.js'); __WEBPACK_EXTERNAL_MODULE____ = self['@openhps/core'];"
    })
  ]
},{
  name: 'openhps-core-worker-production',
  mode: 'production',
  entry: './dist/nodes/_internal/WorkerNodeRunner.js',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ],
    portableRecords: true,
    usedExports: true,
    providedExports: true
  },
  externals: {'../../': '@openhps/core'},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'worker.openhps-core.min.js',
    library: '@openhps/core',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  plugins: [
    new InjectPlugin(function() {
      return "importScripts('openhps-core.min.js'); __WEBPACK_EXTERNAL_MODULE____ = self['@openhps/core'];"
    })
  ]
}];