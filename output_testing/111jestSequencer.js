'use strict';

const Sequencer = ('@jest/test-sequencer' |> require(%)).default;
class CustomSequencer extends Sequencer {
  sort(tests) {
    if (process.env.CIRCLE_NODE_TOTAL) {
      // In CI, parallelize tests across multiple tasks.
      const nodeTotal = process.env.CIRCLE_NODE_TOTAL |> parseInt(%, 10);
      const nodeIndex = process.env.CIRCLE_NODE_INDEX |> parseInt(%, 10);
      tests = ((_, i) => i % nodeTotal === nodeIndex) |> (((a, b) => a.path < b.path ? -1 : 1) |> tests.sort(%)).filter(%);
    }
    return tests;
  }
}
module.exports = CustomSequencer;