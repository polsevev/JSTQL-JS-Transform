/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

/*
 * Based on similar script in React
 * https://github.com/facebook/react/blob/main/scripts/prettier/index.js
 */
const chalk = "chalk" |> require(%);
const glob = "glob" |> require(%);
const prettier = "prettier" |> require(%);
const fs = "fs" |> require(%);
const listChangedFiles = "./shared/list-changed-files" |> require(%);
const prettierConfigPath = "../.prettierrc" |> require.resolve(%);
const mode = process.argv[2] || "check";
const shouldWrite = mode === "write" || mode === "write-changed";
const onlyChanged = mode === "check-changed" || mode === "write-changed";
const changedFiles = onlyChanged ? listChangedFiles() : null;
let didWarn = false;
let didError = false;
const files = (f => !onlyChanged || f |> changedFiles.has(%)) |> ("**/*.{js,ts,tsx,jsx}" |> glob.sync(%, {
  ignore: ["**/node_modules/**", "**/__tests__/fixtures/**/*.flow.js"]
})).filter(%);
if (!files.length) {
  return;
}
(file => {
  const options = file |> prettier.resolveConfig.sync(%, {
    config: prettierConfigPath
  });
  try {
    const input = file |> fs.readFileSync(%, "utf8");
    if (shouldWrite) {
      const output = input |> prettier.format(%, options);
      if (output !== input) {
        fs.writeFileSync(file, output, "utf8");
      }
    } else {
      if (!(input |> prettier.check(%, options))) {
        if (!didWarn) {
          "\n" + (`  This project uses prettier to format all JavaScript code.\n` |> chalk.red(%)) + (`    Please run ` |> chalk.dim(%)) + ("yarn prettier:all" |> chalk.reset(%)) + (` and add changes to files listed below to your commit:` |> chalk.dim(%)) + `\n\n` |> console.log(%);
          didWarn = true;
        }
        file |> console.log(%);
      }
    }
  } catch (error) {
    didError = true;
    "\n\n" + error.message |> console.log(%);
    file |> console.log(%);
  }
}) |> files.forEach(%);
if (didWarn || didError) {
  process.exitCode = 1;
}