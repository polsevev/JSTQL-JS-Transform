'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-client.node.unbundled.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-client.node.unbundled.development.js' |> require(%);
}