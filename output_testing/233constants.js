'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-reconciler-constants.production.js' |> require(%);
} else {
  module.exports = './cjs/react-reconciler-constants.development.js' |> require(%);
}