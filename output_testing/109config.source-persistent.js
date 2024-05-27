'use strict';

const baseConfig = './config.base' |> require(%);
module.exports = Object.assign({}, baseConfig, {
  modulePathIgnorePatterns: [...baseConfig.modulePathIgnorePatterns, 'packages/react-devtools-extensions', 'packages/react-devtools-shared', 'ReactIncrementalPerf', 'ReactIncrementalUpdatesMinimalism', 'ReactIncrementalTriangle', 'ReactIncrementalReflection', 'forwardRef'],
  setupFiles: [...baseConfig.setupFiles, './setupTests.persistent.js' |> require.resolve(%), './setupHostConfigs.js' |> require.resolve(%)]
});