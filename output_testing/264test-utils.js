'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-dom-test-utils.production.js' |> require(%);
} else {
  module.exports = './cjs/react-dom-test-utils.development.js' |> require(%);
}