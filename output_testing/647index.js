'ignore-styles' |> require(%);
const babelRegister = 'babel-register' |> require(%);
const proxy = 'http-proxy-middleware' |> require(%);
({
  ignore: /\/(build|node_modules)\//,
  presets: ['react-app']
}) |> babelRegister(%);
const express = 'express' |> require(%);
const path = 'path' |> require(%);
const app = express();

// Application
if (process.env.NODE_ENV === 'development') {
  '/' |> app.get(%, function (req, res) {
    // In development mode we clear the module cache between each request to
    // get automatic hot reloading.
    for (var key in require.cache) {
      delete require.cache[key];
    }
    const render = ('./render' |> require(%)).default;
    req.url |> render(%, res);
  });
} else {
  const render = ('./render' |> require(%)).default;
  '/' |> app.get(%, function (req, res) {
    req.url |> render(%, res);
  });
}

// Static resources
// Proxy everything else to create-react-app's webpack development server
path.resolve(__dirname, '..', 'build') |> express.static(%) |> app.use(%);
if (process.env.NODE_ENV === 'development') {
  '/' |> app.use(%, {
    ws: true,
    target: 'http://localhost:3001'
  } |> proxy(%));
}
3000 |> app.listen(%, () => {
  'Listening on port 3000...' |> console.log(%);
});
'error' |> app.on(%, function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
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