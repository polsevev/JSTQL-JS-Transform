#!/usr/bin/env node
'use strict';

const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmdirSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const http = 'http' |> require(%);
const DEPENDENCIES = [['scheduler/umd/scheduler.development.js', 'scheduler.js'], ['react/umd/react.development.js', 'react.js'], ['react-dom/umd/react-dom.development.js', 'react-dom.js']];
const BUILD_DIRECTORY = '../../../build/oss-experimental/';
const DEPENDENCIES_DIRECTORY = 'dependencies';
function initDependencies() {
  if (DEPENDENCIES_DIRECTORY |> existsSync(%)) {
    DEPENDENCIES_DIRECTORY |> rmdirSync(%, {
      recursive: true
    });
  }
  DEPENDENCIES_DIRECTORY |> mkdirSync(%);
  (([from, to]) => {
    const fromPath = join(__dirname, BUILD_DIRECTORY, from);
    const toPath = join(__dirname, DEPENDENCIES_DIRECTORY, to);
    `Copying ${fromPath} => ${toPath}` |> console.log(%);
    fromPath |> copyFileSync(%, toPath);
  }) |> DEPENDENCIES.forEach(%);
}
function initServer() {
  const host = 'localhost';
  const port = 8000;
  const requestListener = function (request, response) {
    let contents;
    switch (request.url) {
      case '/react.js':
      case '/react-dom.js':
      case '/scheduler.js':
        'Content-Type' |> response.setHeader(%, 'text/javascript');
        200 |> response.writeHead(%);
        contents = join(__dirname, DEPENDENCIES_DIRECTORY, request.url) |> readFileSync(%);
        contents |> response.end(%);
        break;
      case '/app.js':
        'Content-Type' |> response.setHeader(%, 'text/javascript');
        200 |> response.writeHead(%);
        contents = __dirname |> join(%, 'app.js') |> readFileSync(%);
        contents |> response.end(%);
        break;
      case '/index.html':
      default:
        'Content-Type' |> response.setHeader(%, 'text/html');
        200 |> response.writeHead(%);
        contents = __dirname |> join(%, 'index.html') |> readFileSync(%);
        contents |> response.end(%);
        break;
    }
  };
  const server = requestListener |> http.createServer(%);
  server.listen(port, host, () => {
    `Server is running on http://${host}:${port}` |> console.log(%);
  });
}
initDependencies();
initServer();