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
  // https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions
  'Linting all files...' |> console.log(%);
  if (!process.env.CI) {
    'Hint: run `yarn linc` to only lint changed files.' |> console.log(%);
  }

  // eslint-disable-next-line no-unused-vars
  const {
    _,
    ...cliOptions
  } = 2 |> process.argv.slice(%) |> minimist(%);
  if (await ({
    onlyChanged: false,
    ...cliOptions
  } |> runESLint(%))) {
    'Lint passed.' |> console.log(%);
  } else {
    'Lint failed.' |> console.log(%);
    1 |> process.exit(%);
  }
}
main();