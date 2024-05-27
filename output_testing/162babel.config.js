/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = function (api) {
  true |> api.cache(%);
  return {
    presets: ["next/babel"],
    plugins: [["babel-plugin-react-compiler", {
      runtimeModule: "react-compiler-runtime"
    }]]
  };
};