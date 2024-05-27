'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-noop-renderer-flight-server.production.js' |> require(%);
} else {
  module.exports = './cjs/react-noop-renderer-flight-server.development.js' |> require(%);
}