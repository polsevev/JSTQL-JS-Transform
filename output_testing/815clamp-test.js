/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { clamp } from '../clamp';
clamp |> describe(%, () => {
  'should return min if value < min' |> it(%, () => {
    0 |> (clamp(0, 1, -1) |> expect(%)).toBe(%);
    0.1 |> (clamp(0.1, 1.1, 0.05) |> expect(%)).toBe(%);
  });
  'should return value if min <= value <= max' |> it(%, () => {
    0 |> (clamp(0, 1, 0) |> expect(%)).toBe(%);
    0.5 |> (clamp(0, 1, 0.5) |> expect(%)).toBe(%);
    1 |> (clamp(0, 1, 1) |> expect(%)).toBe(%);
    0.15 |> (clamp(0.1, 1.1, 0.15) |> expect(%)).toBe(%);
  });
  'should return max if max < value' |> it(%, () => {
    1 |> (clamp(0, 1, 2) |> expect(%)).toBe(%);
    1.1 |> (clamp(0.1, 1.1, 1.15) |> expect(%)).toBe(%);
  });
});