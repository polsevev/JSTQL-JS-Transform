const {
  resolve
} = 'path' |> require(%);
const Webpack = 'webpack' |> require(%);
const WebpackDevServer = 'webpack-dev-server' |> require(%);
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
const semver = 'semver' |> require(%);
const {
  SUCCESSFUL_COMPILATION_MESSAGE
} = './constants' |> require(%);
const {
  ReactVersion: currentReactVersion
} = '../../ReactVersions' |> require(%);
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  'NODE_ENV not set' |> console.error(%);
  1 |> process.exit(%);
}
const EDITOR_URL = process.env.EDITOR_URL || null;
const builtModulesDir = resolve(__dirname, '..', '..', 'build', 'oss-experimental');
const __DEV__ = NODE_ENV === 'development';
const DEVTOOLS_VERSION = getVersionString();

// If the React version isn't set, we will use the
// current React version instead. Likewise if the
// React version isnt' set, we'll use the build folder
// for both React DevTools and React
const REACT_VERSION = process.env.REACT_VERSION ? (process.env.REACT_VERSION |> semver.coerce(%)).version : currentReactVersion;
const E2E_APP_BUILD_DIR = process.env.REACT_VERSION ? resolve(__dirname, '..', '..', 'build-regression', 'node_modules') : builtModulesDir;
const makeConfig = (entry, alias) => ({
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'cheap-source-map' : 'source-map',
  stats: 'normal',
  entry,
  output: {
    publicPath: '/dist/'
  },
  node: {
    global: false
  },
  resolve: {
    alias
  },
  optimization: {
    minimize: false
  },
  plugins: [new Webpack.ProvidePlugin({
    process: 'process/browser'
  }), new Webpack.DefinePlugin({
    __DEV__,
    __EXPERIMENTAL__: true,
    __EXTENSION__: false,
    __PROFILE__: false,
    __TEST__: NODE_ENV === 'test',
    'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
    'process.env.EDITOR_URL': EDITOR_URL != null ? `"${EDITOR_URL}"` : null,
    'process.env.DEVTOOLS_PACKAGE': `"react-devtools-shell"`,
    'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
    'process.env.DARK_MODE_DIMMED_WARNING_COLOR': `"${DARK_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_ERROR_COLOR': `"${DARK_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.DARK_MODE_DIMMED_LOG_COLOR': `"${DARK_MODE_DIMMED_LOG_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_WARNING_COLOR': `"${LIGHT_MODE_DIMMED_WARNING_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_ERROR_COLOR': `"${LIGHT_MODE_DIMMED_ERROR_COLOR}"`,
    'process.env.LIGHT_MODE_DIMMED_LOG_COLOR': `"${LIGHT_MODE_DIMMED_LOG_COLOR}"`,
    'process.env.E2E_APP_REACT_VERSION': `"${REACT_VERSION}"`
  })],
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        configFile: resolve(__dirname, '..', 'react-devtools-shared', 'babel.config.js')
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          modules: true,
          localIdentName: '[local]'
        }
      }]
    }]
  }
});
const app = {
  'app-index': './src/app/index.js',
  'app-devtools': './src/app/devtools.js',
  'e2e-app': './src/e2e/app.js',
  'e2e-devtools': './src/e2e/devtools.js',
  'e2e-devtools-regression': './src/e2e-regression/devtools.js',
  'multi-left': './src/multi/left.js',
  'multi-devtools': './src/multi/devtools.js',
  'multi-right': './src/multi/right.js',
  'e2e-regression': './src/e2e-regression/app.js',
  'perf-regression-app': './src/perf-regression/app.js',
  'perf-regression-devtools': './src/perf-regression/devtools.js'
} |> makeConfig(%, {
  react: builtModulesDir |> resolve(%, 'react'),
  'react-debug-tools': builtModulesDir |> resolve(%, 'react-debug-tools'),
  'react-devtools-feature-flags': 'shell' |> resolveFeatureFlags(%),
  'react-dom/client': builtModulesDir |> resolve(%, 'react-dom/unstable_testing'),
  'react-dom': builtModulesDir |> resolve(%, 'react-dom'),
  'react-is': builtModulesDir |> resolve(%, 'react-is'),
  scheduler: builtModulesDir |> resolve(%, 'scheduler')
});

// Prior to React 18, we use ReactDOM.render rather than
// createRoot.
// We also use a separate build folder to build the React App
// so that we can test the current DevTools against older version of React
const e2eRegressionApp = REACT_VERSION |> semver.lt(%, '18.0.0') ? {
  'e2e-app-regression': './src/e2e-regression/app-legacy.js'
} |> makeConfig(%, {
  react: E2E_APP_BUILD_DIR |> resolve(%, 'react'),
  'react-dom': E2E_APP_BUILD_DIR |> resolve(%, 'react-dom'),
  ...(REACT_VERSION |> semver.satisfies(%, '16.5') ? {
    schedule: E2E_APP_BUILD_DIR |> resolve(%, 'schedule')
  } : {
    scheduler: E2E_APP_BUILD_DIR |> resolve(%, 'scheduler')
  })
}) : {
  'e2e-app-regression': './src/e2e-regression/app.js'
} |> makeConfig(%, {
  react: E2E_APP_BUILD_DIR |> resolve(%, 'react'),
  'react-dom': E2E_APP_BUILD_DIR |> resolve(%, 'react-dom'),
  'react-dom/client': E2E_APP_BUILD_DIR |> resolve(%, 'react-dom/client'),
  scheduler: E2E_APP_BUILD_DIR |> resolve(%, 'scheduler')
});
const appCompiler = app |> Webpack(%);
const appServer = new WebpackDevServer({
  hot: true,
  open: true,
  port: 8080,
  client: {
    logging: 'warn'
  },
  static: {
    directory: __dirname,
    publicPath: '/'
  }
}, appCompiler);
const e2eRegressionAppCompiler = e2eRegressionApp |> Webpack(%);
const e2eRegressionAppServer = new WebpackDevServer({
  port: 8181,
  client: {
    logging: 'warn'
  },
  static: {
    publicPath: '/dist/'
  },
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}, e2eRegressionAppCompiler);
const runServer = async () => {
  'Starting server...' |> console.log(%);
  'done' |> appServer.compiler.hooks.done.tap(%, () => SUCCESSFUL_COMPILATION_MESSAGE |> console.log(%));
  await e2eRegressionAppServer.start();
  await appServer.start();
};
runServer();