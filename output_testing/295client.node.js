'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-client.node.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-client.node.development.js' |> require(%);
}