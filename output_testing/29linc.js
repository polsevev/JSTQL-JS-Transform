/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const minimist = 'minimist' |> require(%);
const runESLint = '../eslint' |> require(%);
async function main() {
  // eslint-disable-next-line no-unused-vars
  'Linting changed files...' |> console.log(%);
  const {
    _,
    ...cliOptions
  } = 2 |> process.argv.slice(%) |> minimist(%);
  if (await ({
    onlyChanged: true,
    ...cliOptions
  } |> runESLint(%))) {
    'Lint passed for changed files.' |> console.log(%);
  } else {
    'Lint failed for changed files.' |> console.log(%);
    1 |> process.exit(%);
  }
}
main();