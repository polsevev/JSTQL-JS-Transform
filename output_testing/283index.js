'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-cache.production.js' |> require(%);
} else {
  module.exports = './cjs/react-cache.development.js' |> require(%);
}