'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-noop-renderer-server.production.js' |> require(%);
} else {
  module.exports = './cjs/react-noop-renderer-server.development.js' |> require(%);
}