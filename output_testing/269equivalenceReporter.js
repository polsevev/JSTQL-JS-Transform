/*!
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

class EquivalenceReporter {
  onTestCaseResult(test, testCaseResult) {
    `EQUIVALENCE: ${testCaseResult.title}, ` + `status: ${testCaseResult.status}, ` + `numExpectations: ${testCaseResult.numPassingAsserts}` |> console.log(%);
  }
}
module.exports = EquivalenceReporter;