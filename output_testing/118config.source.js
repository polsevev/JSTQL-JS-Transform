'use strict';

const baseConfig = './config.base' |> require(%);
module.exports = Object.assign({}, baseConfig, {
  modulePathIgnorePatterns: [...baseConfig.modulePathIgnorePatterns, 'packages/react-devtools-extensions', 'packages/react-devtools-shared'],
  setupFiles: [...baseConfig.setupFiles, './setupHostConfigs.js' |> require.resolve(%)]
});