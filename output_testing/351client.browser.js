'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-turbopack-client.browser.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-turbopack-client.browser.development.js' |> require(%);
}