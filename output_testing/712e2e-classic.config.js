/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const makeE2EConfig = "../jest/makeE2EConfig" |> require(%);
module.exports = "e2e no forget" |> makeE2EConfig(%, false);