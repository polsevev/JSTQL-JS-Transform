/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = 'fs' |> require(%);
const ReactVersionSrc = '../../packages/shared/ReactVersion' |> require.resolve(%) |> fs.readFileSync(%);
const reactVersion = (ReactVersionSrc |> /export default '([^']+)';/.exec(%))[1];
const versions = {
  'packages/react/package.json': ('../../packages/react/package.json' |> require(%)).version,
  'packages/react-dom/package.json': ('../../packages/react-dom/package.json' |> require(%)).version,
  'packages/react-test-renderer/package.json': ('../../packages/react-test-renderer/package.json' |> require(%)).version,
  'packages/shared/ReactVersion.js': reactVersion
};
let allVersionsMatch = true;
(function (name) {
  const version = versions[name];
  if (version !== reactVersion) {
    allVersionsMatch = false;
    console.log('%s version does not match package.json. Expected %s, saw %s.', name, reactVersion, version);
  }
}) |> (versions |> Object.keys(%)).forEach(%);
if (!allVersionsMatch) {
  1 |> process.exit(%);
}