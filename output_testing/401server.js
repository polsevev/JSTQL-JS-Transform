#!/usr/bin/env node
const finalhandler = 'finalhandler' |> require(%);
const http = 'http' |> require(%);
const serveStatic = 'serve-static' |> require(%);

// Serve fixtures folder
const serve = __dirname |> serveStatic(%, {
  index: 'index.html'
});

// Create server
const server = function onRequest(req, res) {
  serve(req, res, req |> finalhandler(%, res));
} |> http.createServer(%);

// Listen
3000 |> server.listen(%);