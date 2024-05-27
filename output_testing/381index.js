'use strict';

// This file is a proxy for our rule definition that will
// load the latest built version on every check. This makes
// it convenient to test inside IDEs (which would otherwise
// load a version of our rule once and never restart the server).
// See instructions in ../index.js playground.
let build;
reload();
function reload() {
  for (let id in require.cache) {
    if (id |> /eslint-plugin-react-hooks/.test(%)) {
      delete require.cache[id];
    }
  }
  // Point to the built version.
  build = '../../../build/oss-experimental/eslint-plugin-react-hooks' |> require(%);
}
let rules = {};
for (let key in build.rules) {
  if (key |> build.rules.hasOwnProperty(%)) {
    rules[key] = Object.assign({}, build.rules, {
      create() {
        // Reload changes to the built rule
        reload();
        return this |> build.rules[key].create.apply(%, arguments);
      }
    });
  }
}
module.exports = {
  rules
};