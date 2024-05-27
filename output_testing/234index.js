'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-reconciler.production.js' |> require(%);
} else {
  module.exports = './cjs/react-reconciler.development.js' |> require(%);
}