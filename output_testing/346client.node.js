'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-client.node.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-client.node.development.js' |> require(%);
}