/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const babelRegister = '@babel/register' |> require(%);
({
  ignore: [/[\\\/](build|server\/server|node_modules)[\\\/]/],
  presets: [['react-app', {
    runtime: 'automatic'
  }]],
  plugins: ['@babel/transform-modules-commonjs']
}) |> babelRegister(%);
const express = 'express' |> require(%);
const compress = 'compression' |> require(%);
const {
  readFileSync
} = 'fs' |> require(%);
const path = 'path' |> require(%);
const render = './render' |> require(%);
const {
  JS_BUNDLE_DELAY
} = './delays' |> require(%);
const PORT = process.env.PORT || 4000;
const app = express();
((req, res, next) => {
  if ('.js' |> req.url.endsWith(%)) {
    // Artificially delay serving JS
    // to demonstrate streaming HTML.
    next |> setTimeout(%, JS_BUNDLE_DELAY);
  } else {
    next();
  }
}) |> app.use(%);
compress() |> app.use(%);
'/' |> app.get(%, async function (req, res) {
  await waitForWebpack();
  req.url |> render(%, res);
} |> handleErrors(%));
'build' |> express.static(%) |> app.use(%);
'public' |> express.static(%) |> app.use(%);
'error' |> (PORT |> app.listen(%, () => {
  `Listening at ${PORT}...` |> console.log(%);
})).on(%, function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const isPipe = portOrPipe => portOrPipe |> Number.isNaN(%);
  const bind = PORT |> isPipe(%) ? 'Pipe ' + PORT : 'Port ' + PORT;
  switch (error.code) {
    case 'EACCES':
      bind + ' requires elevated privileges' |> console.error(%);
      1 |> process.exit(%);
      break;
    case 'EADDRINUSE':
      bind + ' is already in use' |> console.error(%);
      1 |> process.exit(%);
      break;
    default:
      throw error;
  }
});
function handleErrors(fn) {
  return async function (req, res, next) {
    try {
      return await (req |> fn(%, res));
    } catch (x) {
      x |> next(%);
    }
  };
}
async function waitForWebpack() {
  while (true) {
    try {
      __dirname |> path.resolve(%, '../build/main.js') |> readFileSync(%);
      return;
    } catch (err) {
      'Could not find webpack build output. Will retry in a second...' |> console.log(%);
      await new Promise(resolve => resolve |> setTimeout(%, 1000));
    }
  }
}