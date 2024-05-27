'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/use-subscription.production.js' |> require(%);
} else {
  module.exports = './cjs/use-subscription.development.js' |> require(%);
}