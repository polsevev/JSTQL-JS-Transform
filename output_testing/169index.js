'use strict';

// TODO: this doesn't make sense for an ESLint rule.
// We need to fix our build process to not create bundles for "raw" packages like this.
if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/eslint-plugin-react-hooks.production.js' |> require(%);
} else {
  module.exports = './cjs/eslint-plugin-react-hooks.development.js' |> require(%);
}