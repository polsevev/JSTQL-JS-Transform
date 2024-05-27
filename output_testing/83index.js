'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react.production.js' |> require(%);
} else {
  module.exports = './cjs/react.development.js' |> require(%);
}