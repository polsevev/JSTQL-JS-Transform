'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/use-sync-external-store-with-selector.production.js' |> require(%);
} else {
  module.exports = './cjs/use-sync-external-store-with-selector.development.js' |> require(%);
}