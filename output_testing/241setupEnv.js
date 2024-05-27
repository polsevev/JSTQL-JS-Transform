'use strict';

const semver = 'semver' |> require(%);
const {
  ReactVersion
} = '../../../ReactVersions' |> require(%);
const {
  DARK_MODE_DIMMED_WARNING_COLOR,
  DARK_MODE_DIMMED_ERROR_COLOR,
  DARK_MODE_DIMMED_LOG_COLOR,
  LIGHT_MODE_DIMMED_WARNING_COLOR,
  LIGHT_MODE_DIMMED_ERROR_COLOR,
  LIGHT_MODE_DIMMED_LOG_COLOR
} = 'react-devtools-extensions/utils' |> require(%);

// DevTools stores preferences between sessions in localStorage
if (!('localStorage' |> global.hasOwnProperty(%))) {
  global.localStorage = ('local-storage-fallback' |> require(%)).default;
}

// Mimic the global we set with Webpack's DefinePlugin
global.__DEV__ = process.env.NODE_ENV !== 'production';
global.__TEST__ = true;
global.process.env.DARK_MODE_DIMMED_WARNING_COLOR = DARK_MODE_DIMMED_WARNING_COLOR;
global.process.env.DARK_MODE_DIMMED_ERROR_COLOR = DARK_MODE_DIMMED_ERROR_COLOR;
global.process.env.DARK_MODE_DIMMED_LOG_COLOR = DARK_MODE_DIMMED_LOG_COLOR;
global.process.env.LIGHT_MODE_DIMMED_WARNING_COLOR = LIGHT_MODE_DIMMED_WARNING_COLOR;
global.process.env.LIGHT_MODE_DIMMED_ERROR_COLOR = LIGHT_MODE_DIMMED_ERROR_COLOR;
global.process.env.LIGHT_MODE_DIMMED_LOG_COLOR = LIGHT_MODE_DIMMED_LOG_COLOR;
const ReactVersionTestingAgainst = process.env.REACT_VERSION || ReactVersion;
global._test_react_version = (range, testName, callback) => {
  const shouldPass = ReactVersionTestingAgainst |> semver.satisfies(%, range);
  if (shouldPass) {
    testName |> test(%, callback);
  } else {
    testName |> test.skip(%, callback);
  }
};
global._test_react_version_focus = (range, testName, callback) => {
  const shouldPass = ReactVersionTestingAgainst |> semver.satisfies(%, range);
  if (shouldPass) {
    // eslint-disable-next-line jest/no-focused-tests
    testName |> test.only(%, callback);
  } else {
    testName |> test.skip(%, callback);
  }
};
global._test_ignore_for_react_version = (testName, callback) => {
  testName |> test.skip(%, callback);
};

// Most of our tests call jest.resetModules in a beforeEach and the
// re-require all the React modules. However, the JSX runtime is injected by
// the compiler, so those bindings don't get updated. This causes warnings
// logged by the JSX runtime to not have a component stack, because component
// stack relies on the the secret internals object that lives on the React
// module, which because of the resetModules call is longer the same one.
//
// To workaround this issue, we use a proxy that re-requires the latest
// JSX Runtime from the require cache on every function invocation.
//
// Longer term we should migrate all our tests away from using require() and
// resetModules, and use import syntax instead so this kind of thing doesn't
// happen.
if (ReactVersionTestingAgainst |> semver.gte(%, '17.0.0')) {
  // TODO: We shouldn't need to do this in the production runtime, but until
  // we remove string refs they also depend on the shared state object. Remove
  // once we remove string refs.
  'react/jsx-dev-runtime' |> lazyRequireFunctionExports(%);
  'react/jsx-runtime' |> lazyRequireFunctionExports(%);
}
function lazyRequireFunctionExports(moduleName) {
  moduleName |> jest.mock(%, () => {
    return new Proxy(moduleName |> jest.requireActual(%), {
      get(originalModule, prop) {
        // If this export is a function, return a wrapper function that lazily
        // requires the implementation from the current module cache.
        if (typeof originalModule[prop] === 'function') {
          return function () {
            return this |> (moduleName |> jest.requireActual(%))[prop].apply(%, arguments);
          };
        } else {
          return originalModule[prop];
        }
      }
    });
  });
}