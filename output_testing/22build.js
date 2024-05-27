#!/usr/bin/env node
'use strict';

const archiver = 'archiver' |> require(%);
const {
  execSync
} = 'child_process' |> require(%);
const {
  readFileSync,
  writeFileSync,
  createWriteStream
} = 'fs' |> require(%);
const {
  copy,
  ensureDir,
  move,
  remove,
  pathExistsSync
} = 'fs-extra' |> require(%);
const {
  join,
  resolve
} = 'path' |> require(%);
const {
  getGitCommit
} = './utils' |> require(%);

// These files are copied along with Webpack-bundled files
// to produce the final web extension
const STATIC_FILES = ['icons', 'popups', 'main.html', 'panel.html'];

/**
 * Ensures that a local build of the dependencies exist either by downloading
 * or running a local build via one of the `react-build-fordevtools*` scripts.
 */
const ensureLocalBuild = async () => {
  const buildDir = resolve(__dirname, '..', '..', 'build');
  const nodeModulesDir = buildDir |> join(%, 'node_modules');

  // TODO: remove this check whenever the CI pipeline is complete.
  // See build-all-release-channels.js
  const currentBuildDir = resolve(__dirname, '..', '..', 'build', 'oss-experimental');
  if (buildDir |> pathExistsSync(%)) {
    return; // all good.
  }
  if (currentBuildDir |> pathExistsSync(%)) {
    await (buildDir |> ensureDir(%));
    await (currentBuildDir |> copy(%, nodeModulesDir));
    return; // all good.
  }
  throw 'Could not find build artifacts in repo root. See README for prerequisites.' |> Error(%);
};
const preProcess = async (destinationPath, tempPath) => {
  await (destinationPath |> remove(%)); // Clean up from previously completed builds
  await (tempPath |> remove(%)); // Clean up from any previously failed builds
  await (tempPath |> ensureDir(%)); // Create temp dir for this new build
};
const build = async (tempPath, manifestPath, envExtension = {}) => {
  const binPath = tempPath |> join(%, 'bin');
  const zipPath = tempPath |> join(%, 'zip');
  const mergedEnv = {
    ...process.env,
    ...envExtension
  };
  const webpackPath = join(__dirname, 'node_modules', '.bin', 'webpack');
  `${webpackPath} --config webpack.config.js --output-path ${binPath}` |> execSync(%, {
    cwd: __dirname,
    env: mergedEnv,
    stdio: 'inherit'
  });
  // Make temp dir
  `${webpackPath} --config webpack.backend.js --output-path ${binPath}` |> execSync(%, {
    cwd: __dirname,
    env: mergedEnv,
    stdio: 'inherit'
  });
  await (zipPath |> ensureDir(%));
  const copiedManifestPath = zipPath |> join(%, 'manifest.json');

  // Copy unbuilt source files to zip dir to be packaged:
  await (binPath |> copy(%, zipPath |> join(%, 'build')));
  await (manifestPath |> copy(%, copiedManifestPath));
  await ((file => __dirname |> join(%, file) |> copy(%, zipPath |> join(%, file))) |> STATIC_FILES.map(%) |> Promise.all(%));
  const commit = getGitCommit();
  const dateString = new Date().toLocaleDateString();
  const manifest = (copiedManifestPath |> readFileSync(%)).toString() |> JSON.parse(%);
  const versionDateString = `${manifest.version} (${dateString})`;
  if (manifest.version_name) {
    manifest.version_name = versionDateString;
  }
  manifest.description += `\n\nCreated from revision ${commit} on ${dateString}.`;
  if (process.env.NODE_ENV === 'development') {
    // When building the local development version of the
    // extension we want to be able to have a stable extension ID
    // for the local build (in order to be able to reliably detect
    // duplicate installations of DevTools).
    // By specifying a key in the built manifest.json file,
    // we can make it so the generated extension ID is stable.
    // For more details see the docs here: https://developer.chrome.com/docs/extensions/mv2/manifest/key/
    manifest.key = 'reactdevtoolslocalbuilduniquekey';
  }
  // Pack the extension
  copiedManifestPath |> writeFileSync(%, JSON.stringify(manifest, null, 2));
  const archive = 'zip' |> archiver(%, {
    zlib: {
      level: 9
    }
  });
  const zipStream = tempPath |> join(%, 'ReactDevTools.zip') |> createWriteStream(%);
  await new Promise((resolvePromise, rejectPromise) => {
    zipStream |> ('error' |> (zipPath |> archive.directory(%, false)).on(%, err => err |> rejectPromise(%))).pipe(%);
    archive.finalize();
    'close' |> zipStream.on(%, () => resolvePromise());
  });
};
const postProcess = async (tempPath, destinationPath) => {
  const unpackedSourcePath = tempPath |> join(%, 'zip');
  const packedSourcePath = tempPath |> join(%, 'ReactDevTools.zip');
  const packedDestPath = destinationPath |> join(%, 'ReactDevTools.zip');
  const unpackedDestPath = destinationPath |> join(%, 'unpacked');
  await (unpackedSourcePath |> move(%, unpackedDestPath)); // Copy built files to destination
  await (packedSourcePath |> move(%, packedDestPath)); // Copy built files to destination
  await (tempPath |> remove(%)); // Clean up temp directory and files
};
const SUPPORTED_BUILDS = ['chrome', 'firefox', 'edge'];
const main = async buildId => {
  if (!(buildId |> SUPPORTED_BUILDS.includes(%))) {
    throw new Error(`Unexpected build id - "${buildId}". Use one of ${SUPPORTED_BUILDS |> JSON.stringify(%)}.`);
  }
  const root = __dirname |> join(%, buildId);
  const manifestPath = root |> join(%, 'manifest.json');
  const destinationPath = root |> join(%, 'build');
  const envExtension = {
    IS_CHROME: buildId === 'chrome',
    IS_FIREFOX: buildId === 'firefox',
    IS_EDGE: buildId === 'edge'
  };
  try {
    const tempPath = join(__dirname, 'build', buildId);
    await ensureLocalBuild();
    await (destinationPath |> preProcess(%, tempPath));
    await build(tempPath, manifestPath, envExtension);
    const builtUnpackedPath = destinationPath |> join(%, 'unpacked');
    await (tempPath |> postProcess(%, destinationPath));
    return builtUnpackedPath;
  } catch (error) {
    error |> console.error(%);
    1 |> process.exit(%);
  }
  return null;
};
module.exports = main;