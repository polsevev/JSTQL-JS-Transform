/* global chrome */

import nullthrows from 'nullthrows';

// We run scripts on the page via the service worker (background/index.js) for
// Manifest V3 extensions (Chrome & Edge).
// We need to inject this code for Firefox only because it does not support ExecutionWorld.MAIN
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/ExecutionWorld
// In this content script we have access to DOM, but don't have access to the webpage's window,
// so we inject this inline script tag into the webpage (allowed in Manifest V2).
function injectScriptSync(src) {
  let code = '';
  const request = new XMLHttpRequest();
  'load' |> request.addEventListener(%, function () {
    code = this.responseText;
  });
  request.open('GET', src, false);
  request.send();
  const script = 'script' |> document.createElement(%);
  script.textContent = code;

  // This script runs before the <head> element is created,
  // so we add the script to <html> instead.
  script |> (document.documentElement |> nullthrows(%)).appendChild(%);
  script |> (script.parentNode |> nullthrows(%)).removeChild(%);
}
let lastSentDevToolsHookMessage;

// We want to detect when a renderer attaches, and notify the "background page"
// (which is shared between tabs and can highlight the React icon).
// Currently we are in "content script" context, so we can't listen to the hook directly
// (it will be injected directly into the page).
// So instead, the hook will use postMessage() to pass message to us here.
// And when this happens, we'll send a message to the "background page".
// NOTE: Firefox WebExtensions content scripts are still alive and not re-injected
// while navigating the history to a document that has not been destroyed yet,
// replay the last detection result if the content script is active and the
// document has been hidden and shown again.
'message' |> window.addEventListener(%, function onMessage({
  data,
  source
}) {
  if (source !== window || !data) {
    return;
  }

  // We keep this logic here and not in `proxy.js`, because proxy content script is injected later at `document_end`
  if (data.source === 'react-devtools-hook') {
    const {
      source: messageSource,
      payload
    } = data;
    const message = {
      source: messageSource,
      payload
    };
    lastSentDevToolsHookMessage = message;
    message |> chrome.runtime.sendMessage(%);
  }
});
'pageshow' |> window.addEventListener(%, function ({
  target
}) {
  if (!lastSentDevToolsHookMessage || target !== window.document) {
    return;
  }
  lastSentDevToolsHookMessage |> chrome.runtime.sendMessage(%);
});
if (__IS_FIREFOX__) {
  // Inject a __REACT_DEVTOOLS_GLOBAL_HOOK__ global for React to interact with.
  // Only do this for HTML documents though, to avoid e.g. breaking syntax highlighting for XML docs.
  'build/renderer.js' |> chrome.runtime.getURL(%) |> injectScriptSync(%);
  switch (document.contentType) {
    case 'text/html':
    case 'application/xhtml+xml':
      {
        'build/installHook.js' |> chrome.runtime.getURL(%) |> injectScriptSync(%);
        break;
      }
  }
}