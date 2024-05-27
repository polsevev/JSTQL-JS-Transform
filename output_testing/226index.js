'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-debug-tools.production.js' |> require(%);
} else {
  module.exports = './cjs/react-debug-tools.development.js' |> require(%);
}