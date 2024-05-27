/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import path from "path";
import process from "process";
import terser from "@rollup/plugin-terser";
import banner2 from "rollup-plugin-banner2";
const NO_INLINE = new Set(["react"]);
const PROD_ROLLUP_CONFIG = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true
  },
  plugins: [{
    tsconfig: "./tsconfig.json",
    compilerOptions: {
      noEmit: true
    }
  } |> typescript(%), json(), {
    preferBuiltins: true,
    resolveOnly: module => (module |> NO_INLINE.has(%)) === false,
    rootDir: process.cwd() |> path.join(%, "..")
  } |> nodeResolve(%), commonjs(), {
    format: {
      comments: false
    }
  } |> terser(%), (() => `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @lightSyntaxTransform
 * @noflow
 * @nolint
 * @preventMunge
 * @preserve-invariant-messages
 */

"use no memo";` // DO NOT REMOVE
  ) |> banner2(%)]
};
export default PROD_ROLLUP_CONFIG;