const TerserPlugin = require('terser-webpack-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const path = require('path');
const pkg = require("./package.json");

const LIBRARY_NAME = pkg.name;
const PROJECT_NAME = pkg.name.replace("@", "").replace("/", "-");

const defaultConfig = env => ({
  mode: env.prod ? "production" : "development",
  devtool: 'source-map',
  resolve: {
    alias: {
      typescript: false,
      'threads/observable': path.join(__dirname, "node_modules", '/threads/observable.js'),
      'threads': path.join(__dirname, "node_modules", '/threads/dist/index.js'),
    },
    fallback: {
      path: false,
      fs: false,
      os: false,
    }
  },
  optimization: {
    minimize: env.prod,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          sourceMap: true,
        }
      })
    ],
    portableRecords: true,
    usedExports: true,
    providedExports: true
  },
  performance: {
    hints: false,
    maxEntrypointSize: 300000,
    maxAssetSize: 300000
  },
});

const bundle = (env, module) => ({
  name: PROJECT_NAME,
  entry: `./dist/esm5/index.js`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `web/${PROJECT_NAME}${module ? ".es" : ""}${env.prod ? ".min" : ""}.js`,
    library: module ? undefined : ['OpenHPS', 'core'],
    libraryTarget: module ? "module" : "umd",
    umdNamedDefine: !module,
    globalObject: module ? undefined : `(typeof self !== 'undefined' ? self : this)`,
  },
  experiments: {
    outputModule: module,
  },
  externals: [],
  plugins: [],
  ...defaultConfig(env)
});

module.exports = env => [
  bundle(env, true),
  bundle(env, false),
  {
    name:`${PROJECT_NAME}-worker`,
    entry: `./dist/cjs/worker/WorkerRunner.js`,
    externals: {'..': LIBRARY_NAME},
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `web/worker.${PROJECT_NAME}${env.prod ? ".min" : ""}.js`,
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    plugins: [
      new InjectPlugin(function() {
        return `importScripts('${PROJECT_NAME}${env.prod ? ".min" : ""}.js'); __WEBPACK_EXTERNAL_MODULE____ = self.OpenHPS.core;`
      })
    ],
    ...defaultConfig(env)
  },
  {
    name:`${PROJECT_NAME}-worker`,
    entry: `./dist/esm5/worker/WorkerRunner.js`,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `web/worker.${PROJECT_NAME}.es${env.prod ? ".min" : ""}.js`,
      libraryTarget: 'module',
      umdNamedDefine: false,
    },
    externals: {'..': `./openhps-core.es${env.prod ? ".min" : ""}.js`},
    plugins: [],
    experiments: {
      outputModule: true,
    },
    ...defaultConfig(env)
  },
  {
    name: PROJECT_NAME,
    entry: `./dist/esm5/index.lite.js`,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `web/${PROJECT_NAME}-lite${env.prod ? ".min" : ""}.js`,
      library: ['OpenHPS', 'core'],
      libraryTarget: "umd",
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    experiments: {
      outputModule: false,
    },
    externals: [],
    plugins: [],
    ...defaultConfig(env)
  }
];
