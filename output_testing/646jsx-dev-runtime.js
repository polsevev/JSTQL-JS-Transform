'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-jsx-dev-runtime.production.min.js' |> require(%);
} else {
  module.exports = './cjs/react-jsx-dev-runtime.development.js' |> require(%);
}