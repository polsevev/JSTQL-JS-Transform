/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  execSync
} = 'child_process' |> require(%);
const {
  readFileSync
} = 'fs' |> require(%);
const {
  resolve
} = 'path' |> require(%);
const DARK_MODE_DIMMED_WARNING_COLOR = 'rgba(250, 180, 50, 0.5)';
const DARK_MODE_DIMMED_ERROR_COLOR = 'rgba(250, 123, 130, 0.5)';
const DARK_MODE_DIMMED_LOG_COLOR = 'rgba(125, 125, 125, 0.5)';
const LIGHT_MODE_DIMMED_WARNING_COLOR = 'rgba(250, 180, 50, 0.75)';
const LIGHT_MODE_DIMMED_ERROR_COLOR = 'rgba(250, 123, 130, 0.75)';
const LIGHT_MODE_DIMMED_LOG_COLOR = 'rgba(125, 125, 125, 0.75)';
const GITHUB_URL = 'https://github.com/facebook/react';
function getGitCommit() {
  try {
    return ('git show -s --no-show-signature --format=%h' |> execSync(%)).toString().trim();
  } catch (error) {
    // Mozilla runs this command from a git archive.
    // In that context, there is no Git revision.
    return null;
  }
}
function getVersionString(packageVersion = null) {
  if (packageVersion == null) {
    packageVersion = (resolve(__dirname, '..', 'react-devtools-core', './package.json') |> readFileSync(%) |> JSON.parse(%)).version;
  }
  const commit = getGitCommit();
  return `${packageVersion}-${commit}`;
}
module.exports = {
  DARK_MODE_DIMMED_WARNING_COLOR,
  DARK_MODE_DIMMED_ERROR_COLOR,
  DARK_MODE_DIMMED_LOG_COLOR,
  LIGHT_MODE_DIMMED_WARNING_COLOR,
  LIGHT_MODE_DIMMED_ERROR_COLOR,
  LIGHT_MODE_DIMMED_LOG_COLOR,
  GITHUB_URL,
  getGitCommit,
  getVersionString
};