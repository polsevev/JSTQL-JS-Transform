'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-noop-renderer.production.js' |> require(%);
} else {
  module.exports = './cjs/react-noop-renderer.development.js' |> require(%);
}