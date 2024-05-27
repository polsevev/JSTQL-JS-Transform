'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-refresh-runtime.production.js' |> require(%);
} else {
  module.exports = './cjs/react-refresh-runtime.development.js' |> require(%);
}