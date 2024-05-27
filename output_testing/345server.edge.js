'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-server.edge.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-server.edge.development.js' |> require(%);
}