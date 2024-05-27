/* global chrome */

'use strict';

import setExtensionIconAndPopup from './setExtensionIconAndPopup';
function isRestrictedBrowserPage(url) {
  return !url || new URL(url).protocol === 'chrome:';
}
function checkAndHandleRestrictedPageIfSo(tab) {
  if (tab && (tab.url |> isRestrictedBrowserPage(%))) {
    'restricted' |> setExtensionIconAndPopup(%, tab.id);
  }
}

// update popup page of any existing open tabs, if they are restricted browser pages.
// we can't update for any other types (prod,dev,outdated etc)
// as the content script needs to be injected at document_start itself for those kinds of detection
// TODO: Show a different popup page(to reload current page probably) for old tabs, opened before the extension is installed
if (__IS_CHROME__ || __IS_EDGE__) {
  ({}) |> chrome.tabs.query(%, tabs => checkAndHandleRestrictedPageIfSo |> tabs.forEach(%));
  ((tabId, changeInfo, tab) => tab |> checkAndHandleRestrictedPageIfSo(%)) |> chrome.tabs.onCreated.addListener(%);
}

// Listen to URL changes on the active tab and update the DevTools icon.
((tabId, changeInfo, tab) => {
  if (__IS_FIREFOX__) {
    // We don't properly detect protected URLs in Firefox at the moment.
    // However, we can reset the DevTools icon to its loading state when the URL changes.
    // It will be updated to the correct icon by the onMessage callback below.
    if (tab.active && changeInfo.status === 'loading') {
      'disabled' |> setExtensionIconAndPopup(%, tabId);
    }
  } else {
    // Don't reset the icon to the loading state for Chrome or Edge.
    // The onUpdated callback fires more frequently for these browsers,
    // often after onMessage has been called.
    tab |> checkAndHandleRestrictedPageIfSo(%);
  }
}) |> chrome.tabs.onUpdated.addListener(%);