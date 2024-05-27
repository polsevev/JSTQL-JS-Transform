'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = '../cjs/use-sync-external-store-shim.native.production.js' |> require(%);
} else {
  module.exports = '../cjs/use-sync-external-store-shim.native.development.js' |> require(%);
}