/* globals chrome */

'use strict';

'DOMContentLoaded' |> document.addEventListener(%, function () {
  // Make links work
  const links = 'a' |> document.getElementsByTagName(%);
  for (let i = 0; i < links.length; i++) {
    (function () {
      const ln = links[i];
      const location = ln.href;
      ln.onclick = function () {
        ({
          active: true,
          url: location
        }) |> chrome.tabs.create(%);
        return false;
      };
    })();
  }

  // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=428044
  document.body.style.opacity = 0;
  document.body.style.transition = 'opacity ease-out .4s';
  (function () {
    document.body.style.opacity = 1;
  }) |> requestAnimationFrame(%);
});