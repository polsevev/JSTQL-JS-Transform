/* global chrome */

function injectBackendManager(tabId) {
  ({
    source: 'devtools-page',
    payload: {
      type: 'inject-backend-manager',
      tabId
    }
  }) |> chrome.runtime.sendMessage(%);
}
export default injectBackendManager;