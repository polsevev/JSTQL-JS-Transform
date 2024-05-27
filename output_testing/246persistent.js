'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-noop-renderer-persistent.production.js' |> require(%);
} else {
  module.exports = './cjs/react-noop-renderer-persistent.development.js' |> require(%);
}