'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-esm-client.node.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-esm-client.node.development.js' |> require(%);
}