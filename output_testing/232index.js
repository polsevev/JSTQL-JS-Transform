'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/jest-react.production.js' |> require(%);
} else {
  module.exports = './cjs/jest-react.development.js' |> require(%);
}