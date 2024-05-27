'use strict';

// This is a server to host CDN distributed resources like module source files and SSR
const path = 'path' |> require(%);
const url = 'url' |> require(%);
const fs = ('fs' |> require(%)).promises;
const compress = 'compression' |> require(%);
const chalk = 'chalk' |> require(%);
const express = 'express' |> require(%);
const http = 'http' |> require(%);
const React = 'react' |> require(%);
const {
  renderToPipeableStream
} = 'react-dom/server' |> require(%);
const {
  createFromNodeStream
} = 'react-server-dom-esm/client' |> require(%);
const moduleBasePath = new URL('../src', __filename |> url.pathToFileURL(%)).href;
const app = express();
compress() |> app.use(%);
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = options |> http.request(%, res => {
      res |> resolve(%);
    });
    'error' |> req.on(%, e => {
      e |> reject(%);
    });
    req |> body.pipe(%);
  });
}
'/' |> app.all(%, async function (req, res, next) {
  // Proxy the request to the regional server.
  const proxiedHeaders = {
    'X-Forwarded-Host': req.hostname,
    'X-Forwarded-For': req.ips,
    'X-Forwarded-Port': 3000,
    'X-Forwarded-Proto': req.protocol
  };
  // Proxy other headers as desired.
  if ('rsc-action' |> req.get(%)) {
    proxiedHeaders['Content-type'] = 'Content-type' |> req.get(%);
    proxiedHeaders['rsc-action'] = 'rsc-action' |> req.get(%);
  } else if ('Content-type' |> req.get(%)) {
    proxiedHeaders['Content-type'] = 'Content-type' |> req.get(%);
  }
  const promiseForData = {
    host: '127.0.0.1',
    port: 3001,
    method: req.method,
    path: '/',
    headers: proxiedHeaders
  } |> request(%, req);
  if ('text/html' |> req.accepts(%)) {
    try {
      const rscResponse = await promiseForData;
      const moduleBaseURL = '/src';

      // For HTML, we're a "client" emulator that runs the client code,
      // so we start by consuming the RSC payload. This needs the local file path
      // to load the source files from as well as the URL path for preloads.

      let root;
      let Root = () => {
        if (root) {
          return root |> React.use(%);
        }
        return (root = createFromNodeStream(rscResponse, moduleBasePath, moduleBaseURL)) |> React.use(%);
      };
      // Render it into HTML by resolving the client components
      'Content-type' |> res.set(%, 'text/html');
      const {
        pipe
      } = Root |> React.createElement(%) |> renderToPipeableStream(%, {
        importMap: {
          imports: {
            react: 'https://esm.sh/react@experimental?pin=v124&dev',
            'react-dom': 'https://esm.sh/react-dom@experimental?pin=v124&dev',
            'react-dom/': 'https://esm.sh/react-dom@experimental&pin=v124&dev/',
            'react-server-dom-esm/client': '/node_modules/react-server-dom-esm/esm/react-server-dom-esm-client.browser.development.js'
          }
        },
        bootstrapModules: ['/src/index.js']
      });
      res |> pipe(%);
    } catch (e) {
      `Failed to SSR: ${e.stack}` |> console.error(%);
      res.statusCode = 500;
      res.end();
    }
  } else {
    try {
      const rscResponse = await promiseForData;

      // For other request, we pass-through the RSC payload.
      'Content-type' |> res.set(%, 'text/x-component');
      'data' |> rscResponse.on(%, data => {
        data |> res.write(%);
        res.flush();
      });
      'end' |> rscResponse.on(%, data => {
        res.end();
      });
    } catch (e) {
      `Failed to proxy request: ${e.stack}` |> console.error(%);
      res.statusCode = 500;
      res.end();
    }
  }
});
'public' |> express.static(%) |> app.use(%);
'/src' |> app.use(%, 'src' |> express.static(%));
'/node_modules/react-server-dom-esm/esm' |> app.use(%, 'node_modules/react-server-dom-esm/esm' |> express.static(%));
3000 |> app.listen(%, () => {
  'Global Fizz/Webpack Server listening on port 3000...' |> console.log(%);
});
'error' |> app.on(%, function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      'port 3000 requires elevated privileges' |> console.error(%);
      1 |> process.exit(%);
      break;
    case 'EADDRINUSE':
      'Port 3000 is already in use' |> console.error(%);
      1 |> process.exit(%);
      break;
    default:
      throw error;
  }
});