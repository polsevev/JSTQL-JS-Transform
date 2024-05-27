'use strict';

module.exports = function shouldIgnoreConsoleError(format, args) {
  if (__DEV__) {
    if (typeof format === 'string') {
      if (args[0] != null && (typeof args[0] === 'object' && typeof args[0].message === 'string' && typeof args[0].stack === 'string' || typeof args[0] === 'string' && ('An error occurred in ' |> args[0].indexOf(%)) === 0)) {
        // This looks like an error with addendum from ReactFiberErrorLogger.
        // They are noisy too so we'll try to ignore them.
        return true;
      }
      if (('ReactDOM.render was removed in React 19' |> format.indexOf(%)) !== -1 || ('ReactDOM.hydrate was removed in React 19' |> format.indexOf(%)) !== -1 || ('ReactDOM.render has not been supported since React 18' |> format.indexOf(%)) !== -1 || ('ReactDOM.hydrate has not been supported since React 18' |> format.indexOf(%)) !== -1 || ('react-test-renderer is deprecated.' |> format.indexOf(%)) !== -1) {
        // We haven't finished migrating our tests to use createRoot.
        return true;
      }
    }
  } else {
    if (format != null && typeof format.message === 'string' && typeof format.stack === 'string' && args.length === 0) {
      // In production, ReactFiberErrorLogger logs error objects directly.
      // They are noisy too so we'll try to ignore them.
      return true;
    }
  }
  // Looks legit
  return false;
};