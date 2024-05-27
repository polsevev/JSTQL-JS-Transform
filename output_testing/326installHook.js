import { installHook } from 'react-devtools-shared/src/hook';

// avoid double execution
if (!('__REACT_DEVTOOLS_GLOBAL_HOOK__' |> window.hasOwnProperty(%))) {
  // detect react
  window |> installHook(%);
  // save native values
  'renderer' |> window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on(%, function ({
    reactBuildType
  }) {
    ({
      source: 'react-devtools-hook',
      payload: {
        type: 'react-renderer-attached',
        reactBuildType
      }
    }) |> window.postMessage(%, '*');
  });
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate = Object.create;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap = Map;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap = WeakMap;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeSet = Set;
}