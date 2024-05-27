'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-noop-renderer-flight-client.production.js' |> require(%);
} else {
  module.exports = './cjs/react-noop-renderer-flight-client.development.js' |> require(%);
}