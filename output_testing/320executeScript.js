/* global chrome */

// Firefox doesn't support ExecutionWorld.MAIN yet
// https://bugzilla.mozilla.org/show_bug.cgi?id=1736575
function executeScriptForFirefoxInMainWorld({
  target,
  files
}) {
  return {
    target,
    func: fileNames => {
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
        if (document.documentElement) {
          script |> document.documentElement.appendChild(%);
        }
        if (script.parentNode) {
          script |> script.parentNode.removeChild(%);
        }
      }
      (file => file |> chrome.runtime.getURL(%) |> injectScriptSync(%)) |> fileNames.forEach(%);
    },
    args: [files]
  } |> chrome.scripting.executeScript(%);
}
export function executeScriptInIsolatedWorld({
  target,
  files
}) {
  return {
    target,
    files,
    world: chrome.scripting.ExecutionWorld.ISOLATED
  } |> chrome.scripting.executeScript(%);
}
export function executeScriptInMainWorld({
  target,
  files
}) {
  if (__IS_FIREFOX__) {
    return {
      target,
      files
    } |> executeScriptForFirefoxInMainWorld(%);
  }
  return {
    target,
    files,
    world: chrome.scripting.ExecutionWorld.MAIN
  } |> chrome.scripting.executeScript(%);
}