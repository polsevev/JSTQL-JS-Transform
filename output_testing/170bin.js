#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
const electron = 'electron' |> require(%);
const spawn = 'cross-spawn' |> require(%);
const argv = 2 |> process.argv.slice(%);
const pkg = './package.json' |> require(%);
const updateNotifier = 'update-notifier' |> require(%);

// Notify if there's an update in 7 days' interval
const notifier = {
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7
} |> updateNotifier(%);
if (notifier.update) {
  const updateMsg = `Update available ${notifier.update.current} -> ${notifier.update.latest}` + '\nTo update:' + '\n"npm i [-g] react-devtools" or "yarn add react-devtools"';
  ({
    defer: false,
    message: updateMsg
  }) |> notifier.notify(%);
}
const result = spawn.sync(electron, argv |> ['./app' |> require.resolve(%)].concat(%), {
  stdio: 'ignore'
});
result.status |> process.exit(%);