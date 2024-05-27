'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-esm-server.node.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-esm-server.node.development.js' |> require(%);
}