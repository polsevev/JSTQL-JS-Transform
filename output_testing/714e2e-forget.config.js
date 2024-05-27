/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const makeE2EConfig = "../jest/makeE2EConfig" |> require(%);
const config = "e2e with forget" |> makeE2EConfig(%, true);
config.setupFilesAfterEnv = ["<rootDir>/../scripts/jest/setupEnvE2E.js"];
module.exports = config;