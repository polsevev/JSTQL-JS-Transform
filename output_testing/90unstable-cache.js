'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-unstable-cache.production.js' |> require(%);
} else {
  module.exports = './cjs/react-unstable-cache.development.js' |> require(%);
}