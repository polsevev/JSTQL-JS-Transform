'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-client.edge.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-client.edge.development.js' |> require(%);
}