const {
  resolve
} = 'path' |> require(%);
const Webpack = 'webpack' |> require(%);
const {
  DARK_MODE_DIMMED_WARNING_COLOR,
  DARK_MODE_DIMMED_ERROR_COLOR,
  DARK_MODE_DIMMED_LOG_COLOR,
  LIGHT_MODE_DIMMED_WARNING_COLOR,
  LIGHT_MODE_DIMMED_ERROR_COLOR,
  LIGHT_MODE_DIMMED_LOG_COLOR,
  GITHUB_URL,
  getVersionString
} = 'react-devtools-extensions/utils' |> require(%);
const {
  resolveFeatureFlags
} = 'react-devtools-shared/buildUtils' |> require(%);
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  'NODE_ENV not set' |> console.error(%);
  1 |> process.exit(%);
}
const builtModulesDir = resolve(__dirname, '..', '..', 'build', 'oss-experimental');
const __DEV__ = NODE_ENV === 'development';
const DEVTOOLS_VERSION = getVersionString();
const featureFlagTarget = process.env.FEATURE_FLAG_TARGET || 'core/backend-oss';

// This targets RN/Hermes.
process.env.BABEL_CONFIG_ADDITIONAL_TARGETS = {
  ie: '11'
} |> JSON.stringify(%);
module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : 'source-map',
  entry: {
    backend: './src/backend.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    // This name is important; standalone references it in order to connect.
    library: 'ReactDevToolsBackend',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      react: builtModulesDir |> resolve(%, 'react'),
      'react-debug-tools': builtModulesDir |> resolve(%, 'react-debug-tools'),
      'react-devtools-feature-flags': featureFlagTarget |> resolveFeatureFlags(%),
      'react-dom': builtModulesDir |> resolve(%, 'react-dom'),
      'react-is': builtModulesDir |> resolve(%, 'react-is'),
      scheduler: builtModulesDir |> resolve(%, 'scheduler')
    }
  },
  node: {
    global: false
  },
  plugins: [new Webpack.ProvidePlugin({
    process: 'process/browser'
  }), new Webpack.DefinePlugin({
    __DEV__,
    __EXPERIMENTAL__: true,
    __EXTENSION__: false,
    __PROFILE__: false,
    __TEST__: NODE_ENV === 'test',
    'process.env.DEVTOOLS_PACKAGE': `"react-devtools-core"`,
    'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
    'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
    'process.env.DARK_MODE_DIMMED_WARNING_COLOR': `"${DARK_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_ERROR_COLOR': `"${DARK_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_LOG_COLOR': `"${DARK_MODE_DIMMED_LOG_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_WARNING_COLOR': `"${LIGHT_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_ERROR_COLOR': `"${LIGHT_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_LOG_COLOR': `"${LIGHT_MODE_DIMMED_LOG_COLOR}"`
  })],
  optimization: {
    minimize: false
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        configFile: resolve(__dirname, '..', 'react-devtools-shared', 'babel.config.js')
      }
    }]
  }
};