'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-client.edge.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-client.edge.development.js' |> require(%);
}