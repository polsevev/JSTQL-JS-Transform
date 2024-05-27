'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-server.node.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-server.node.development.js' |> require(%);
}