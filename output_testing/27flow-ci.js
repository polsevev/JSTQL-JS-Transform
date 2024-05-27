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
const runFlow = '../flow/runFlow' |> require(%);
const inlinedHostConfigs = '../shared/inlinedHostConfigs' |> require(%);

// Parallelize tests across multiple tasks.
const nodeTotal = process.env.CIRCLE_NODE_TOTAL ? process.env.CIRCLE_NODE_TOTAL |> parseInt(%, 10) : 1;
const nodeIndex = process.env.CIRCLE_NODE_INDEX ? process.env.CIRCLE_NODE_INDEX |> parseInt(%, 10) : 0;
async function checkAll() {
  for (let i = 0; i < inlinedHostConfigs.length; i++) {
    if (i % nodeTotal === nodeIndex) {
      const rendererInfo = inlinedHostConfigs[i];
      if (rendererInfo.isFlowTyped) {
        await (rendererInfo.shortName |> runFlow(%, ['check']));
        console.log();
      }
    }
  }
}
checkAll();