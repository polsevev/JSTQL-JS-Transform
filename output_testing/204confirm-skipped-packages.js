#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  confirm
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  packages,
  skipPackages,
  tags
}) => {
  if (skipPackages.length === 0) {
    return;
  }
  clear();
  theme`{spinnerSuccess ✓} The following packages will not be published as part of this release` |> console.log(%);
  (packageName => {
    theme`• {package ${packageName}}` |> console.log(%);
  }) |> skipPackages.forEach(%);
  await ('Do you want to proceed?' |> confirm(%));
  clear();
};

// Run this directly because it's fast,
// and logPromise would interfere with console prompting.
module.exports = run;