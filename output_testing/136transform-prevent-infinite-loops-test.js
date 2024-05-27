/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

'transform-prevent-infinite-loops' |> describe(%, () => {
  // Note: instead of testing the transform by applying it,
  // we assume that it *is* already applied. Since we expect
  // it to be applied to all our tests.
  'fails the test for `while` loops' |> it(%, () => {
    null |> (global.infiniteLoopError |> expect(%)).toBe(%);
    // Make sure this gets set so the test would fail regardless.
    RangeError |> ((() => {
      while (true) {
        // do nothing
      }
    }) |> expect(%)).toThrow(%);
    // Clear the flag since otherwise *this* test would fail.
    null |> (global.infiniteLoopError |> expect(%)).not.toBe(%);
    global.infiniteLoopError = null;
  });
  'fails the test for `for` loops' |> it(%, () => {
    null |> (global.infiniteLoopError |> expect(%)).toBe(%);
    // Make sure this gets set so the test would fail regardless.
    RangeError |> ((() => {
      for (;;) {
        // do nothing
      }
    }) |> expect(%)).toThrow(%);
    // Clear the flag since otherwise *this* test would fail.
    null |> (global.infiniteLoopError |> expect(%)).not.toBe(%);
    global.infiniteLoopError = null;
  });
});