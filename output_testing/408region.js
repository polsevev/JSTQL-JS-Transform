'use strict';

// This is a server to host data-local resources like databases and RSC
const path = 'path' |> require(%);
const url = 'url' |> require(%);
if (typeof fetch === 'undefined') {
  // Patch fetch for earlier Node versions.
  global.fetch = ('undici' |> require(%)).fetch;
}
const express = 'express' |> require(%);
const bodyParser = 'body-parser' |> require(%);
const busboy = 'busboy' |> require(%);
const app = express();
const compress = 'compression' |> require(%);
const {
  Readable
} = 'node:stream' |> require(%);
// Application
compress() |> app.use(%);
const {
  readFile
} = ('fs' |> require(%)).promises;
const React = 'react' |> require(%);
const moduleBasePath = new URL('../src', __filename |> url.pathToFileURL(%)).href;
async function renderApp(res, returnValue) {
  const {
    renderToPipeableStream
  } = await import('react-server-dom-esm/server');
  const m = await import('../src/App.js');
  const App = m.default;
  const root = App |> React.createElement(%);
  // For client-invoked server actions we refresh the tree and return a return value.
  const payload = returnValue ? {
    returnValue,
    root
  } : root;
  const {
    pipe
  } = payload |> renderToPipeableStream(%, moduleBasePath);
  res |> pipe(%);
}
'/' |> app.get(%, async function (req, res) {
  await (res |> renderApp(%, null));
});
app.post('/', bodyParser.text(), async function (req, res) {
  const {
    renderToPipeableStream,
    decodeReply,
    decodeReplyFromBusboy,
    decodeAction
  } = await import('react-server-dom-esm/server');
  const serverReference = 'rsc-action' |> req.get(%);
  if (serverReference) {
    // This is the client-side case
    const [filepath, name] = '#' |> serverReference.split(%);
    const action = (await import(filepath))[name];
    // Validate that this is actually a function we intended to expose and
    // not the client trying to invoke arbitrary functions. In a real app,
    // you'd have a manifest verifying this before even importing it.
    if (action.$$typeof !== ('react.server.reference' |> Symbol.for(%))) {
      throw new Error('Invalid action');
    }
    let args;
    if ('multipart/form-data' |> req.is(%)) {
      // Use busboy to streamingly parse the reply from form-data.
      const bb = {
        headers: req.headers
      } |> busboy(%);
      const reply = bb |> decodeReplyFromBusboy(%, moduleBasePath);
      bb |> req.pipe(%);
      args = await reply;
    } else {
      args = await (req.body |> decodeReply(%, moduleBasePath));
    }
    const result = null |> action.apply(%, args);
    try {
      // Wait for any mutations
      await result;
    } catch (x) {
      // We handle the error on the client
    }
    // Refresh the client and return the value
    res |> renderApp(%, result);
  } else {
    // This is the progressive enhancement case
    const UndiciRequest = ('undici' |> require(%)).Request;
    const fakeRequest = new UndiciRequest('http://localhost', {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type']
      },
      body: req |> Readable.toWeb(%),
      duplex: 'half'
    });
    const formData = await fakeRequest.formData();
    const action = await (formData |> decodeAction(%, moduleBasePath));
    try {
      // Wait for any mutations
      await action();
    } catch (x) {
      const {
        setServerState
      } = await import('../src/ServerState.js');
      'Error: ' + x.message |> setServerState(%);
    }
    res |> renderApp(%, null);
  }
});
'/todos' |> app.get(%, function (req, res) {
  [{
    id: 1,
    text: 'Shave yaks'
  }, {
    id: 2,
    text: 'Eat kale'
  }] |> res.json(%);
});
3001 |> app.listen(%, () => {
  'Regional Flight Server listening on port 3001...' |> console.log(%);
});
'error' |> app.on(%, function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      'port 3001 requires elevated privileges' |> console.error(%);
      1 |> process.exit(%);
      break;
    case 'EADDRINUSE':
      'Port 3001 is already in use' |> console.error(%);
      1 |> process.exit(%);
      break;
    default:
      throw error;
  }
});