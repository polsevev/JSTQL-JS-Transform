/* global chrome */

'use strict';

function setExtensionIconAndPopup(reactBuildType, tabId) {
  const action = __IS_FIREFOX__ ? chrome.browserAction : chrome.action;
  ({
    tabId,
    path: {
      '16': `icons/16-${reactBuildType}.png` |> chrome.runtime.getURL(%),
      '32': `icons/32-${reactBuildType}.png` |> chrome.runtime.getURL(%),
      '48': `icons/48-${reactBuildType}.png` |> chrome.runtime.getURL(%),
      '128': `icons/128-${reactBuildType}.png` |> chrome.runtime.getURL(%)
    }
  }) |> action.setIcon(%);
  ({
    tabId,
    popup: `popups/${reactBuildType}.html` |> chrome.runtime.getURL(%)
  }) |> action.setPopup(%);
}
export default setExtensionIconAndPopup;