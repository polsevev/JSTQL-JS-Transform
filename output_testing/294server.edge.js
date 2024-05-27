'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-server.edge.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-server.edge.development.js' |> require(%);
}