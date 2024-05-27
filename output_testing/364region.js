'use strict';

// This is a server to host data-local resources like databases and RSC
const path = 'path' |> require(%);
const register = 'react-server-dom-webpack/node-register' |> require(%);
register();
const babelRegister = '@babel/register' |> require(%);
({
  babelrc: false,
  ignore: [/\/(build|node_modules)\//, function (file) {
    if (__dirname + '/' |> ((file |> path.dirname(%)) + '/').startsWith(%)) {
      // Ignore everything in this folder
      // because it's a mix of CJS and ESM
      // and working with raw code is easier.
      return true;
    }
    return false;
  }],
  presets: ['@babel/preset-react'],
  plugins: ['@babel/transform-modules-commonjs']
}) |> babelRegister(%);
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
async function renderApp(res, returnValue, formState) {
  const {
    renderToPipeableStream
  } = await import('react-server-dom-webpack/server');
  // const m = require('../src/App.js');
  const m = await import('../src/App.js');
  let moduleMap;
  let mainCSSChunks;
  if (process.env.NODE_ENV === 'development') {
    // Read the module map from the HMR server in development.
    moduleMap = await (await ('http://localhost:3000/react-client-manifest.json' |> fetch(%))).json();
    mainCSSChunks = (await (await ('http://localhost:3000/entrypoint-manifest.json' |> fetch(%))).json()).main.css;
  } else {
    // Read the module map from the static build in production.
    moduleMap = (await (__dirname |> path.resolve(%, `../build/react-client-manifest.json`) |> readFile(%, 'utf8'))) |> JSON.parse(%);
    mainCSSChunks = ((await (__dirname |> path.resolve(%, `../build/entrypoint-manifest.json`) |> readFile(%, 'utf8'))) |> JSON.parse(%)).main.css;
  }
  const App = m.default.default || m.default;
  const root = [(filename => 'link' |> React.createElement(%, {
    rel: 'stylesheet',
    href: filename,
    precedence: 'default'
  })) |> mainCSSChunks.map(%), App |> React.createElement(%)];
  // For client-invoked server actions we refresh the tree and return a return value.
  const payload = {
    root,
    returnValue,
    formState
  };
  const {
    pipe
  } = payload |> renderToPipeableStream(%, moduleMap);
  res |> pipe(%);
}
'/' |> app.get(%, async function (req, res) {
  await renderApp(res, null, null);
});
app.post('/', bodyParser.text(), async function (req, res) {
  const {
    decodeReply,
    decodeReplyFromBusboy,
    decodeAction,
    decodeFormState
  } = await import('react-server-dom-webpack/server');
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
      const reply = bb |> decodeReplyFromBusboy(%);
      bb |> req.pipe(%);
      args = await reply;
    } else {
      args = await (req.body |> decodeReply(%));
    }
    const result = null |> action.apply(%, args);
    try {
      // Wait for any mutations
      await result;
    } catch (x) {
      // We handle the error on the client
    }
    // Refresh the client and return the value
    renderApp(res, result, null);
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
    const action = await (formData |> decodeAction(%));
    try {
      // Wait for any mutations
      const result = await action();
      const formState = result |> decodeFormState(%, formData);
      renderApp(res, null, formState);
    } catch (x) {
      const {
        setServerState
      } = await import('../src/ServerState.js');
      'Error: ' + x.message |> setServerState(%);
      renderApp(res, null, null);
    }
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