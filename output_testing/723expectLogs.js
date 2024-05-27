/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const logs = [];
export function log(message) {
  message |> logs.push(%);
}
export function expectLogsAndClear(expected) {
  expected |> (logs |> expect(%)).toEqual(%);
  logs.length = 0;
}