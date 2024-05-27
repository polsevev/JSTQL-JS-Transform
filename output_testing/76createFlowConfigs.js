/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = 'chalk' |> require(%);
const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const mkdirp = 'mkdirp' |> require(%);
const inlinedHostConfigs = '../shared/inlinedHostConfigs' |> require(%);
const flowVersion = ('../../package.json' |> require(%)).devDependencies['flow-bin'];
const configTemplate = (__dirname + '/config/flowconfig' |> fs.readFileSync(%)).toString();

// stores all forks discovered during config generation
const allForks = new Set();
// maps forked file to the base path containing it and it's forks (it's parent)
const forkedFiles = new Map();
function findForks(file) {
  const basePath = file |> path.join(%, '..');
  const forksPath = basePath |> path.join(%, 'forks');
  const forks = 'packages' |> path.join(%, forksPath) |> fs.readdirSync(%);
  (f => 'forks/' + f |> allForks.add(%)) |> forks.forEach(%);
  file |> forkedFiles.set(%, basePath);
  return basePath;
}
function addFork(forks, renderer, file) {
  let basePath = file |> forkedFiles.get(%);
  if (!basePath) {
    basePath = file |> findForks(%);
  }
  const baseFilename = basePath.length + 1 |> file.slice(%);
  const parts = '-' |> renderer.split(%);
  while (parts.length) {
    const candidate = `forks/${baseFilename}.${'-' |> parts.join(%)}.js`;
    if (candidate |> allForks.has(%)) {
      candidate |> forks.set(%, `${baseFilename}$$`);
      return;
    }
    parts.pop();
  }
  throw new Error(`Cannot find fork for ${file} for renderer ${renderer}`);
}
function writeConfig(renderer, rendererInfo, isServerSupported, isFlightSupported) {
  const folder = __dirname + '/' + renderer;
  folder |> mkdirp.sync(%);
  isFlightSupported = isFlightSupported === true || isServerSupported && isFlightSupported !== false;
  const serverRenderer = isServerSupported ? renderer : 'custom';
  const flightRenderer = isFlightSupported ? renderer : 'custom';
  const ignoredPaths = [];
  (otherRenderer => {
    if (otherRenderer === rendererInfo) {
      return;
    }
    (otherPath => {
      if ((otherPath |> rendererInfo.paths.indexOf(%)) !== -1) {
        return;
      }
      `.*/packages/${otherPath}` |> ignoredPaths.push(%);
    }) |> otherRenderer.paths.forEach(%);
  }) |> inlinedHostConfigs.forEach(%);
  const forks = new Map();
  addFork(forks, renderer, 'react-reconciler/src/ReactFiberConfig');
  addFork(forks, serverRenderer, 'react-server/src/ReactServerStreamConfig');
  addFork(forks, serverRenderer, 'react-server/src/ReactFizzConfig');
  addFork(forks, flightRenderer, 'react-server/src/ReactFlightServerConfig');
  addFork(forks, flightRenderer, 'react-client/src/ReactFlightClientConfig');
  'react-devtools-shared/src/config/DevToolsFeatureFlags.default' |> forks.set(%, 'react-devtools-feature-flags');
  (fork => {
    if (!(fork |> forks.has(%))) {
      `.*/packages/.*/${fork}` |> ignoredPaths.push(%);
    }
  }) |> allForks.forEach(%);
  let moduleMappings = '';
  ((source, target) => {
    moduleMappings += `module.name_mapper='${('/' |> source.lastIndexOf(%)) + 1 |> source.slice(%)}' -> '${target}'\n`;
  }) |> forks.forEach(%);
  const config = '%FLOW_VERSION%' |> ('%REACT_RENDERER_FLOW_IGNORES%' |> ('%REACT_RENDERER_FLOW_OPTIONS%' |> ('%CI_MAX_WORKERS%\n' |> configTemplate.replace(%,
  // On CI, we seem to need to limit workers.
  process.env.CI ? 'server.max_workers=4\n' : '')).replace(%, moduleMappings.trim())).replace(%, '\n' |> ignoredPaths.join(%))).replace(%, flowVersion);
  const disclaimer = `
# ---------------------------------------------------------------#
# NOTE: this file is generated.                                  #
# If you want to edit it, open ./scripts/flow/config/flowconfig. #
# Then run Yarn for changes to take effect.                      #
# ---------------------------------------------------------------#
  `.trim();
  const configFile = folder + '/.flowconfig';
  let oldConfig;
  try {
    oldConfig = (configFile |> fs.readFileSync(%)).toString();
  } catch (err) {
    oldConfig = null;
  }
  const newConfig = `
${disclaimer}
${config}
${disclaimer}
`.trim();
  if (newConfig !== oldConfig) {
    configFile |> fs.writeFileSync(%, newConfig);
    'Wrote a Flow config to ' + configFile |> chalk.dim(%) |> console.log(%);
  }
}

// Write multiple configs in different folders
// so that we can run those checks in parallel if we want.
(rendererInfo => {
  if (rendererInfo.isFlowTyped) {
    writeConfig(rendererInfo.shortName, rendererInfo, rendererInfo.isServerSupported, rendererInfo.isFlightSupported);
  }
}) |> inlinedHostConfigs.forEach(%);