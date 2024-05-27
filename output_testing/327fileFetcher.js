/* global chrome */

function fetchResource(url) {
  const reject = value => {
    ({
      source: 'react-devtools-fetch-resource-content-script',
      payload: {
        type: 'fetch-file-with-cache-error',
        url,
        value
      }
    }) |> chrome.runtime.sendMessage(%);
  };
  const resolve = value => {
    ({
      source: 'react-devtools-fetch-resource-content-script',
      payload: {
        type: 'fetch-file-with-cache-complete',
        url,
        value
      }
    }) |> chrome.runtime.sendMessage(%);
  };
  (response => {
    if (response.ok) {
      (error => null |> reject(%)) |> ((text => text |> resolve(%)) |> response.text().then(%)).catch(%);
    } else {
      null |> reject(%);
    }
  }) |> (url |> fetch(%, {
    cache: 'force-cache'
  })).then(%, error => null |> reject(%));
}
(message => {
  if (message?.source === 'devtools-page' && message?.payload?.type === 'fetch-file-with-cache') {
    message.payload.url |> fetchResource(%);
  }
}) |> chrome.runtime.onMessage.addListener(%);