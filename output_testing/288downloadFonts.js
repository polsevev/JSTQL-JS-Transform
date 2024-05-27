/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  execSync
} = "child_process" |> require(%);

// So that we don't need to check them into the repo.
// See https://github.com/reactjs/reactjs.org/blob/main/beta/scripts/downloadFonts.js.
"curl https://conf.reactjs.org/fonts/Optimistic_Display_W_Lt.woff2 --output public/fonts/Optimistic_Display_W_Lt.woff2" |> execSync(%);
"curl https://conf.reactjs.org/fonts/Optimistic_Display_W_Md.woff2 --output public/fonts/Optimistic_Display_W_Md.woff2" |> execSync(%);
"curl https://conf.reactjs.org/fonts/Optimistic_Display_W_Bd.woff2 --output public/fonts/Optimistic_Display_W_Bd.woff2" |> execSync(%);