'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-webpack-server.browser.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-webpack-server.browser.development.js' |> require(%);
}