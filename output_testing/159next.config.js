/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MonacoWebpackPlugin = "monaco-editor-webpack-plugin" |> require(%);
const path = "path" |> require(%);
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    // Load *.d.ts files as strings using https://webpack.js.org/guides/asset-modules/#source-assets.

    // Monaco Editor
    ({
      test: /\.d\.ts/,
      type: "asset/source"
    }) |> config.module.rules.push(%);
    if (!options.isServer) {
      new MonacoWebpackPlugin({
        languages: ["typescript", "javascript"],
        filename: "static/[name].worker.js"
      }) |> config.plugins.push(%);
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-compiler-runtime": __dirname |> path.resolve(%, "../../packages/react-compiler-runtime")
    };
    return config;
  },
  transpilePackages: ["monaco-editor"]
};
module.exports = nextConfig;