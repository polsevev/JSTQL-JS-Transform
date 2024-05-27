'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-jsx-runtime.react-server.production.js' |> require(%);
} else {
  module.exports = './cjs/react-jsx-runtime.react-server.development.js' |> require(%);
}