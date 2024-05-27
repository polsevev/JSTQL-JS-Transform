import * as React from 'react';
import { use, Suspense, useState, startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import { createFromFetch, encodeReply } from 'react-server-dom-esm/client';
const moduleBaseURL = '/src/';
let updateRoot;
async function callServer(id, args) {
  const response = '/' |> fetch(%, {
    method: 'POST',
    headers: {
      Accept: 'text/x-component',
      'rsc-action': id
    },
    body: await (args |> encodeReply(%))
  });
  const {
    returnValue,
    root
  } = await (response |> createFromFetch(%, {
    callServer,
    moduleBaseURL
  }));
  // Refresh the tree with the new RSC payload.
  (() => {
    root |> updateRoot(%);
  }) |> startTransition(%);
  return returnValue;
}
let data = '/' |> fetch(%, {
  headers: {
    Accept: 'text/x-component'
  }
}) |> createFromFetch(%, {
  callServer,
  moduleBaseURL
});
function Shell({
  data
}) {
  const [root, setRoot] = data |> use(%) |> useState(%);
  updateRoot = setRoot;
  return root;
}
document |> ReactDOM.hydrateRoot(%, Shell |> React.createElement(%, {
  data
}));