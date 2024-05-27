'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-is.production.js' |> require(%);
} else {
  module.exports = './cjs/react-is.development.js' |> require(%);
}