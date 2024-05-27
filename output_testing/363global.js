'use strict';

// This is a server to host CDN distributed resources like Webpack bundles and SSR
const path = 'path' |> require(%);

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = process.env.NODE_ENV;
const babelRegister = '@babel/register' |> require(%);
// Ensure environment variables are read.
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
  presets: ['@babel/preset-react']
}) |> babelRegister(%);
'../config/env' |> require(%);
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
} = 'react-server-dom-webpack/client' |> require(%);
const {
  PassThrough
} = 'stream' |> require(%);
const app = express();
compress() |> app.use(%);
if (process.env.NODE_ENV === 'development') {
  // In development we host the Webpack server for live bundling.
  const webpack = 'webpack' |> require(%);
  const webpackMiddleware = 'webpack-dev-middleware' |> require(%);
  const webpackHotMiddleware = 'webpack-hot-middleware' |> require(%);
  const paths = '../config/paths' |> require(%);
  const configFactory = '../config/webpack.config' |> require(%);
  const getClientEnvironment = '../config/env' |> require(%);
  const env = 0 |> paths.publicUrlOrPath.slice(%, -1) |> getClientEnvironment(%);
  const config = 'development' |> configFactory(%);
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const appName = (paths.appPackageJson |> require(%)).name;

  // Create a webpack compiler that is configured with custom messages.
  const compiler = config |> webpack(%);
  compiler |> webpackMiddleware(%, {
    publicPath: 0 |> paths.publicUrlOrPath.slice(%, -1),
    serverSideRender: true,
    headers: () => {
      return {
        'Cache-Control': 'no-store, must-revalidate'
      };
    }
  }) |> app.use(%);
  compiler |> webpackHotMiddleware(%) |> app.use(%);
}
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
      let virtualFs;
      let buildPath;
      if (process.env.NODE_ENV === 'development') {
        const {
          devMiddleware
        } = res.locals.webpack;
        virtualFs = devMiddleware.outputFileSystem.promises;
        buildPath = devMiddleware.stats.toJson().outputPath;
      } else {
        virtualFs = fs;
        buildPath = __dirname |> path.join(%, '../build/');
      }
      // Read the module map from the virtual file system.
      const ssrManifest = (await (buildPath |> path.join(%, 'react-ssr-manifest.json') |> virtualFs.readFile(%, 'utf8'))) |> JSON.parse(%);

      // Read the entrypoints containing the initial JS to bootstrap everything.
      // For other pages, the chunks in the RSC payload are enough.
      const mainJSChunks = ((await (buildPath |> path.join(%, 'entrypoint-manifest.json') |> virtualFs.readFile(%, 'utf8'))) |> JSON.parse(%)).main.js;
      // For HTML, we're a "client" emulator that runs the client code,
      // so we start by consuming the RSC payload. This needs a module
      // map that reverse engineers the client-side path to the SSR path.

      // We need to get the formState before we start rendering but we also
      // need to run the Flight client inside the render to get all the preloads.
      // The API is ambivalent about what's the right one so we need two for now.

      // Tee the response into two streams so that we can do both.
      const rscResponse1 = new PassThrough();
      const rscResponse2 = new PassThrough();
      rscResponse1 |> rscResponse.pipe(%);
      rscResponse2 |> rscResponse.pipe(%);
      const {
        formState
      } = await (rscResponse1 |> createFromNodeStream(%, ssrManifest));
      rscResponse1.end();
      let cachedResult;
      let Root = () => {
        if (!cachedResult) {
          // Read this stream inside the render.
          cachedResult = rscResponse2 |> createFromNodeStream(%, ssrManifest);
        }
        return (cachedResult |> React.use(%)).root;
      };
      // Render it into HTML by resolving the client components
      'Content-type' |> res.set(%, 'text/html');
      const {
        pipe
      } = Root |> React.createElement(%) |> renderToPipeableStream(%, {
        bootstrapScripts: mainJSChunks,
        formState: formState,
        onShellReady() {
          res |> pipe(%);
        },
        onShellError(error) {
          const {
            pipe: pipeError
          } = React.createElement('html', null, 'body' |> React.createElement(%)) |> renderToPipeableStream(%, {
            bootstrapScripts: mainJSChunks
          });
          res |> pipeError(%);
        }
      });
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
if (process.env.NODE_ENV === 'development') {
  'public' |> express.static(%) |> app.use(%);
} else {
  // In production we host the static build output.
  'build' |> express.static(%) |> app.use(%);
}
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