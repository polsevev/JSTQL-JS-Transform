'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-client.node.unbundled.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-client.node.unbundled.development.js' |> require(%);
}