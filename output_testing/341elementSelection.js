/* global chrome */

export function setBrowserSelectionFromReact() {
  // This is currently only called on demand when you press "view DOM".
  // In the future, if Chrome adds an inspect() that doesn't switch tabs,
  // we could make this happen automatically when you select another component.
  '(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 !== $0) ?' + '(inspect(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0), true) :' + 'false' |> chrome.devtools.inspectedWindow.eval(%, (didSelectionChange, evalError) => {
    if (evalError) {
      evalError |> console.error(%);
    }
  });
}
export function setReactSelectionFromBrowser(bridge) {
  // When the user chooses a different node in the browser Elements tab,
  // copy it over to the hook object so that we can sync the selection.
  '(window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 !== $0) ?' + '(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 = $0, true) :' + 'false' |> chrome.devtools.inspectedWindow.eval(%, (didSelectionChange, evalError) => {
    if (evalError) {
      evalError |> console.error(%);
    } else if (didSelectionChange) {
      if (!bridge) {
        'Browser element selection changed, but bridge was not initialized' |> console.error(%);
        return;
      }

      // Remember to sync the selection next time we show Components tab.
      'syncSelectionFromNativeElementsPanel' |> bridge.send(%);
    }
  });
}