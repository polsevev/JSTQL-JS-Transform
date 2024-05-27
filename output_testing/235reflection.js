'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-reconciler-reflection.production.js' |> require(%);
} else {
  module.exports = './cjs/react-reconciler-reflection.development.js' |> require(%);
}