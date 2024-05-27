'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-server.node.unbundled.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-server.node.unbundled.development.js' |> require(%);
}