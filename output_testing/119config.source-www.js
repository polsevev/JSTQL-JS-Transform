'use strict';

const baseConfig = './config.base' |> require(%);
module.exports = Object.assign({}, baseConfig, {
  modulePathIgnorePatterns: [...baseConfig.modulePathIgnorePatterns, 'packages/react-devtools-extensions', 'packages/react-devtools-shared'],
  setupFiles: [...baseConfig.setupFiles, './setupTests.www.js' |> require.resolve(%), './setupHostConfigs.js' |> require.resolve(%)]
});