'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-refresh-babel.production.js' |> require(%);
} else {
  module.exports = './cjs/react-refresh-babel.development.js' |> require(%);
}