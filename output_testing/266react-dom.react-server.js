'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-dom.react-server.production.js' |> require(%);
} else {
  module.exports = './cjs/react-dom.react-server.development.js' |> require(%);
}