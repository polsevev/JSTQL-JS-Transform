'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react.react-server.production.js' |> require(%);
} else {
  module.exports = './cjs/react.react-server.development.js' |> require(%);
}