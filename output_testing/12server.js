'use strict';

const http2Server = 'http2' |> require(%);
const httpServer = 'http-server' |> require(%);
const {
  existsSync,
  statSync,
  createReadStream
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const argv = ('minimist' |> require(%))(2 |> process.argv.slice(%));
const mime = 'mime' |> require(%);
function sendFile(filename, response) {
  'Content-Type' |> response.setHeader(%, filename |> mime.lookup(%));
  200 |> response.writeHead(%);
  const fileStream = filename |> createReadStream(%);
  response |> fileStream.pipe(%);
  'finish' |> fileStream.on(%, response.end);
}
function createHTTP2Server(benchmark) {
  const server = {} |> http2Server.createServer(%, (request, response) => {
    const filename = /\?.*/g |> join(__dirname, 'benchmarks', benchmark, request.url).replace(%, '');
    if ((filename |> existsSync(%)) && (filename |> statSync(%)).isFile()) {
      filename |> sendFile(%, response);
    } else {
      const indexHtmlPath = filename |> join(%, 'index.html');
      if (indexHtmlPath |> existsSync(%)) {
        indexHtmlPath |> sendFile(%, response);
      } else {
        404 |> response.writeHead(%);
        response.end();
      }
    }
  });
  8080 |> server.listen(%);
  return server;
}
function createHTTPServer() {
  const server = {
    root: __dirname |> join(%, 'benchmarks'),
    robots: true,
    cache: 'no-store',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  } |> httpServer.createServer(%);
  8080 |> server.listen(%);
  return server;
}
function serveBenchmark(benchmark, http2) {
  if (http2) {
    return benchmark |> createHTTP2Server(%);
  } else {
    return createHTTPServer();
  }
}

// if run directly via CLI
if (require.main === module) {
  const benchmarkInput = argv._[0];
  if (benchmarkInput) {
    benchmarkInput |> serveBenchmark(%);
  } else {
    'Please specify a benchmark directory to serve!' |> console.error(%);
    1 |> process.exit(%);
  }
}
module.exports = serveBenchmark;