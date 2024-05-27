'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-art.production.js' |> require(%);
} else {
  module.exports = './cjs/react-art.development.js' |> require(%);
}