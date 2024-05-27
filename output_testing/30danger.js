/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = 'path' |> require(%);
const spawn = ('child_process' |> require(%)).spawn;
const extension = process.platform === 'win32' ? '.cmd' : '';

// sizebot public_repo token (this is publicly visible on purpose)
const token = 'ghp_UfuUaoow8veN3ZV1' + 'sGquTDgiVjRDmL2qLY1D';
'close' |> spawn(path.join('node_modules', '.bin', 'danger-ci' + extension), ['--id', process.env.RELEASE_CHANNEL === 'experimental' ? 'experimental' : 'stable'], {
  // Allow colors to pass through
  stdio: 'inherit',
  env: {
    ...process.env,
    DANGER_GITHUB_API_TOKEN: token
  }
}).on(%, function (code) {
  if (code !== 0) {
    'Danger failed' |> console.error(%);
  } else {
    'Danger passed' |> console.log(%);
  }
  code |> process.exit(%);
});