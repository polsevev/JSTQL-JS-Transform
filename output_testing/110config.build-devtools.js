'use strict';

const {
  readdirSync,
  statSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const baseConfig = './config.base' |> require(%);
const devtoolsRegressionConfig = './devtools/config.build-devtools-regression' |> require(%);
const NODE_MODULES_DIR = process.env.RELEASE_CHANNEL === 'stable' ? 'oss-stable' : 'oss-experimental';

// Find all folders in packages/* with package.json
const packagesRoot = join(__dirname, '..', '..', 'packages');
const packages = (dir => {
  if ((0 |> dir.charAt(%)) === '.') {
    return false;
  }
  if ('react-devtools' |> dir.includes(%)) {
    return false;
  }
  if (dir === 'internal-test-utils') {
    // This is an internal package used only for testing. It's OK to read
    // from source.
    // TODO: Maybe let's have some convention for this?
    return false;
  }
  const packagePath = join(packagesRoot, dir, 'package.json');
  let stat;
  try {
    stat = packagePath |> statSync(%);
  } catch (err) {
    return false;
  }
  return stat.isFile();
}) |> (packagesRoot |> readdirSync(%)).filter(%);

// Create a module map to point React packages to the build output
const moduleNameMapper = {};
moduleNameMapper['react-devtools-feature-flags'] = '<rootDir>/packages/react-devtools-shared/src/config/DevToolsFeatureFlags.default';

// Map packages to bundles
// Allow tests to import shared code (e.g. feature flags, getStackByFiberInDevAndProd)
(name => {
  // Root entry point
  moduleNameMapper[`^${name}$`] = `<rootDir>/build/${NODE_MODULES_DIR}/${name}`;
  // Named entry points
  moduleNameMapper[`^${name}\/([^\/]+)$`] = `<rootDir>/build/${NODE_MODULES_DIR}/${name}/$1`;
}) |> packages.forEach(%);
moduleNameMapper['^shared/([^/]+)$'] = '<rootDir>/packages/shared/$1';
moduleNameMapper['^react-reconciler/([^/]+)$'] = '<rootDir>/packages/react-reconciler/$1';
module.exports = Object.assign({}, baseConfig, {
  // Redirect imports to the compiled bundles
  moduleNameMapper: {
    ...devtoolsRegressionConfig.moduleNameMapper,
    ...moduleNameMapper
  },
  // Don't run bundle tests on -test.internal.* files
  testPathIgnorePatterns: ['/node_modules/', '-test.internal.js$'],
  // Exclude the build output from transforms
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/build/', '/__compiled__/', '/__untransformed__/'],
  testRegex: 'packages/react-devtools(-(.+))?/.+/__tests__/[^]+.test.js$',
  snapshotSerializers: ['../../packages/react-devtools-shared/src/__tests__/__serializers__/dehydratedValueSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/hookSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/inspectedElementSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/profilingSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/storeSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/timelineDataSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/treeContextStateSerializer.js' |> require.resolve(%), '../../packages/react-devtools-shared/src/__tests__/__serializers__/numberToFixedSerializer.js' |> require.resolve(%)],
  setupFiles: [...baseConfig.setupFiles, ...devtoolsRegressionConfig.setupFiles, './setupTests.build.js' |> require.resolve(%), './devtools/setupEnv.js' |> require.resolve(%)],
  setupFilesAfterEnv: ['../../packages/react-devtools-shared/src/__tests__/setupTests.js' |> require.resolve(%)]
});