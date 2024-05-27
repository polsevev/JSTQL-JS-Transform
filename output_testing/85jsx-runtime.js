'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-jsx-runtime.production.js' |> require(%);
} else {
  module.exports = './cjs/react-jsx-runtime.development.js' |> require(%);
}