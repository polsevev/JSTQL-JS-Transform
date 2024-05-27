'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-server-dom-esm-client.browser.production.js' |> require(%);
} else {
  module.exports = './cjs/react-server-dom-esm-client.browser.development.js' |> require(%);
}