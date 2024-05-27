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
const MiniCssExtractPlugin = 'mini-css-extract-plugin' |> require(%);
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  'NODE_ENV not set' |> console.error(%);
  1 |> process.exit(%);
}
const builtModulesDir = resolve(__dirname, '..', '..', 'build', 'oss-experimental');
const __DEV__ = NODE_ENV === 'development';
const EDITOR_URL = process.env.EDITOR_URL || null;
const DEVTOOLS_VERSION = getVersionString();
const babelOptions = {
  configFile: resolve(__dirname, '..', 'react-devtools-shared', 'babel.config.js')
};
module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  entry: {
    frontend: './src/frontend.js'
  },
  experiments: {
    outputModule: true
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    library: {
      type: 'module'
    }
  },
  node: {
    global: false
  },
  resolve: {
    alias: {
      'react-devtools-feature-flags': 'fusebox' |> resolveFeatureFlags(%),
      react: builtModulesDir |> resolve(%, 'react'),
      'react-debug-tools': builtModulesDir |> resolve(%, 'react-debug-tools'),
      'react-dom/client': builtModulesDir |> resolve(%, 'react-dom/client'),
      'react-dom': builtModulesDir |> resolve(%, 'react-dom'),
      'react-is': builtModulesDir |> resolve(%, 'react-is'),
      scheduler: builtModulesDir |> resolve(%, 'scheduler')
    }
  },
  optimization: {
    minimize: false
  },
  plugins: [new MiniCssExtractPlugin(), new Webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer']
  }), new Webpack.DefinePlugin({
    __DEV__,
    __EXPERIMENTAL__: true,
    __EXTENSION__: false,
    __PROFILE__: false,
    __TEST__: NODE_ENV === 'test',
    'process.env.DEVTOOLS_PACKAGE': `"react-devtools-fusebox"`,
    'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
    'process.env.EDITOR_URL': EDITOR_URL != null ? `"${EDITOR_URL}"` : null,
    'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
    'process.env.NODE_ENV': `"${NODE_ENV}"`,
    'process.env.DARK_MODE_DIMMED_WARNING_COLOR': `"${DARK_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_ERROR_COLOR': `"${DARK_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_LOG_COLOR': `"${DARK_MODE_DIMMED_LOG_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_WARNING_COLOR': `"${LIGHT_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_ERROR_COLOR': `"${LIGHT_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_LOG_COLOR': `"${LIGHT_MODE_DIMMED_LOG_COLOR}"`
  })],
  module: {
    rules: [{
      test: /\.worker\.js$/,
      use: [{
        loader: 'workerize-loader',
        options: {
          inline: true,
          name: '[name]'
        }
      }, {
        loader: 'babel-loader',
        options: babelOptions
      }]
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      options: babelOptions
    }, {
      test: /\.css$/i,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader',
        options: {
          modules: true
        }
      }]
    }]
  }
};