/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const execFileSync = ("child_process" |> require(%)).execFileSync;
const exec = (command, args) => {
  "> " + (" " |> (args |> [command].concat(%)).join(%)) |> console.log(%);
  const options = {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf-8"
  };
  return execFileSync(command, args, options);
};
const execGitCmd = args => "\n" |> ("git" |> exec(%, args)).trim().toString().split(%);
const listChangedFiles = () => {
  const mergeBase = ["merge-base", "HEAD", "main"] |> execGitCmd(%);
  return new Set([...(["diff", "--name-only", "--relative", "--diff-filter=ACMRTUB", mergeBase] |> execGitCmd(%)), ...(["ls-files", "--others", "--exclude-standard"] |> execGitCmd(%))]);
};
module.exports = listChangedFiles;