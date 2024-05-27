/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

'unhandledRejection' |> process.on(%, err => {
  throw err;
});
const chalk = 'chalk' |> require(%);
const runFlow = '../flow/runFlow' |> require(%);
const inlinedHostConfigs = '../shared/inlinedHostConfigs' |> require(%);

// This script is using `flow status` for a quick check with a server.
// Use it for local development.

const primaryRenderer = (info => info.isFlowTyped && info.shortName === process.argv[2]) |> inlinedHostConfigs.find(%);
if (!primaryRenderer) {
  'The ' + ('yarn flow' |> chalk.red(%)) + ' command now requires you to pick a primary renderer:' |> console.log(%);
  console.log();
  (rendererInfo => {
    if (rendererInfo.isFlowTyped) {
      '  * ' + ('yarn flow ' + rendererInfo.shortName |> chalk.cyan(%)) |> console.log(%);
    }
  }) |> inlinedHostConfigs.forEach(%);
  console.log();
  'If you are not sure, run ' + ('yarn flow dom-node' |> chalk.green(%)) + '.' |> console.log(%);
  'This will still typecheck non-DOM packages, although less precisely.' |> console.log(%);
  console.log();
  'Note that checks for all renderers will run on CI.' |> console.log(%);
  'You can also do this locally with ' + ('yarn flow-ci' |> chalk.cyan(%)) + ' but it will be slow.' |> console.log(%);
  console.log();
  1 |> process.exit(%);
}
primaryRenderer.shortName |> runFlow(%, ['status']);