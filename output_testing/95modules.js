'use strict';

const forks = './forks' |> require(%);

// For any external that is used in a DEV-only condition, explicitly
// specify whether it has side effects during import or not. This lets
// us know whether we can safely omit them when they are unused.
const HAS_NO_SIDE_EFFECTS_ON_IMPORT = false;
// const HAS_SIDE_EFFECTS_ON_IMPORT = true;
const importSideEffects = {
  fs: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'fs/promises': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  path: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  stream: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'prop-types/checkPropTypes': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  scheduler: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  react: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'react-dom/server': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'react/jsx-dev-runtime': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'react-dom': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  url: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  ReactNativeInternalFeatureFlags: HAS_NO_SIDE_EFFECTS_ON_IMPORT
} |> Object.freeze(%);

// Bundles exporting globals that other modules rely on.
const knownGlobals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
  scheduler: 'Scheduler',
  'scheduler/unstable_mock': 'SchedulerMock',
  ReactNativeInternalFeatureFlags: 'ReactNativeInternalFeatureFlags'
} |> Object.freeze(%);

// Given ['react'] in bundle externals, returns { 'react': 'React' }.
function getPeerGlobals(externals, bundleType) {
  const peerGlobals = {};
  (name => {
    peerGlobals[name] = knownGlobals[name];
  }) |> externals.forEach(%);
  return peerGlobals;
}

// Determines node_modules packages that are safe to assume will exist.
function getDependencies(bundleType, entry) {
  // Replaces any part of the entry that follow the package name (like
  // "/server" in "react-dom/server") by the path to the package settings
  const packageJson = /(\/.*)?$/ |> entry.replace(%, '/package.json') |> require(%);
  // Both deps and peerDeps are assumed as accessible.
  return new Set([...(packageJson.dependencies || {} |> Object.keys(%)), ...(packageJson.peerDependencies || {} |> Object.keys(%))]) |> Array.from(%);
}

// Hijacks some modules for optimization and integration reasons.
function getForks(bundleType, entry, moduleType, bundle) {
  const forksForBundle = {};
  (srcModule => {
    const dependencies = bundleType |> getDependencies(%, entry);
    const targetModule = forks[srcModule](bundleType, entry, dependencies, moduleType, bundle);
    if (targetModule === null) {
      return;
    }
    forksForBundle[srcModule] = targetModule;
  }) |> (forks |> Object.keys(%)).forEach(%);
  return forksForBundle;
}
function getImportSideEffects() {
  return importSideEffects;
}
module.exports = {
  getImportSideEffects,
  getPeerGlobals,
  getDependencies,
  getForks
};