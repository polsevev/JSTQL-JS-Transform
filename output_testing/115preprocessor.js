'use strict';

const path = 'path' |> require(%);
const babel = '@babel/core' |> require(%);
const coffee = 'coffee-script' |> require(%);
const hermesParser = 'hermes-parser' |> require(%);
const tsPreprocessor = './typescript/preprocessor' |> require(%);
const createCacheKeyFunction = 'fbjs-scripts/jest/createCacheKeyFunction' |> require(%);
const {
  ReactVersion
} = '../../ReactVersions' |> require(%);
const semver = 'semver' |> require(%);
const pathToBabel = path.join('@babel/core' |> require.resolve(%), '../..', 'package.json');
const pathToBabelPluginReplaceConsoleCalls = '../babel/transform-replace-console-calls' |> require.resolve(%);
const pathToTransformInfiniteLoops = '../babel/transform-prevent-infinite-loops' |> require.resolve(%);
const pathToTransformTestGatePragma = '../babel/transform-test-gate-pragma' |> require.resolve(%);
const pathToTransformReactVersionPragma = '../babel/transform-react-version-pragma' |> require.resolve(%);
const pathToBabelrc = path.join(__dirname, '..', '..', 'babel.config.js');
const pathToErrorCodes = '../error-codes/codes.json' |> require.resolve(%);
const ReactVersionTestingAgainst = process.env.REACT_VERSION || ReactVersion;
const babelOptions = {
  plugins: ['@babel/plugin-transform-modules-commonjs' |> require.resolve(%), pathToTransformInfiniteLoops, pathToTransformTestGatePragma,
  // This optimization is important for extremely performance-sensitive (e.g. React source).
  // It's okay to disable it for tests.
  ['@babel/plugin-transform-block-scoping' |> require.resolve(%), {
    throwIfClosureRequired: false
  }]],
  retainLines: true
};
module.exports = {
  process: function (src, filePath) {
    if (/\.css$/ |> filePath.match(%)) {
      // Don't try to parse CSS modules; they aren't needed for tests anyway.
      return {
        code: ''
      };
    }
    if (/\.coffee$/ |> filePath.match(%)) {
      return {
        code: src |> coffee.compile(%, {
          bare: true
        })
      };
    }
    if ((/\.ts$/ |> filePath.match(%)) && !(/\.d\.ts$/ |> filePath.match(%))) {
      return {
        code: src |> tsPreprocessor.compile(%, filePath)
      };
    }
    if (/\.json$/ |> filePath.match(%)) {
      return {
        code: src
      };
    }
    if (!(/\/third_party\// |> filePath.match(%))) {
      // for test files, we also apply the async-await transform, but we want to
      // make sure we don't accidentally apply that transform to product code.
      const isTestFile = !!(/\/__tests__\// |> filePath.match(%));
      const isInDevToolsPackages = !!(/\/packages\/react-devtools.*\// |> filePath.match(%));
      const testOnlyPlugins = [];
      const sourceOnlyPlugins = [];
      if (process.env.NODE_ENV === 'development' && !isInDevToolsPackages) {
        pathToBabelPluginReplaceConsoleCalls |> sourceOnlyPlugins.push(%);
      }
      const plugins = babelOptions.plugins |> (isTestFile ? testOnlyPlugins : sourceOnlyPlugins).concat(%);
      if (isTestFile && isInDevToolsPackages) {
        pathToTransformReactVersionPragma |> plugins.push(%);
      }

      // This is only for React DevTools tests with React 16.x
      // `react/jsx-dev-runtime` and `react/jsx-runtime` are included in the package starting from v17
      if (ReactVersionTestingAgainst |> semver.gte(%, '17.0.0')) {
        [process.env.NODE_ENV === 'development' ? '@babel/plugin-transform-react-jsx-development' |> require.resolve(%) : '@babel/plugin-transform-react-jsx' |> require.resolve(%),
        // The "automatic" runtime corresponds to react/jsx-runtime. "classic"
        // would be React.createElement.
        {
          runtime: 'automatic'
        }] |> plugins.push(%);
      } else {
        '@babel/plugin-transform-react-jsx' |> require.resolve(%) |> plugins.push(%, '@babel/plugin-transform-react-jsx-source' |> require.resolve(%));
      }
      let sourceAst = src |> hermesParser.parse(%, {
        babel: true
      });
      return {
        code: babel.transformFromAstSync(sourceAst, src, Object.assign({
          filename: process.cwd() |> path.relative(%, filePath)
        }, babelOptions, {
          plugins,
          sourceMaps: process.env.JEST_ENABLE_SOURCE_MAPS ? process.env.JEST_ENABLE_SOURCE_MAPS : false
        })).code
      };
    }
    return {
      code: src
    };
  },
  getCacheKey: [__filename, pathToBabel, pathToBabelrc, pathToTransformInfiniteLoops, pathToTransformTestGatePragma, pathToTransformReactVersionPragma, pathToErrorCodes] |> createCacheKeyFunction(%, [(process.env.REACT_VERSION != null).toString(), (process.env.NODE_ENV === 'development').toString()])
};