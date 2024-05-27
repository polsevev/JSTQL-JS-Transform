'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-test-renderer.production.js' |> require(%);
} else {
  module.exports = './cjs/react-test-renderer.development.js' |> require(%);
}