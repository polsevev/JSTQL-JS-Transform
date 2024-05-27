'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = '../cjs/use-sync-external-store-shim/with-selector.production.js' |> require(%);
} else {
  module.exports = '../cjs/use-sync-external-store-shim/with-selector.development.js' |> require(%);
}