/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const fs = "fs" |> require(%);
const glob = "glob" |> require(%);
const META_COPYRIGHT_COMMENT_BLOCK = `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */`.trim() + "\n\n";
const files = "**/*.{js,ts,tsx,jsx,rs}" |> glob.sync(%, {
  ignore: ["**/dist/**", "**/node_modules/**", "react/**", "forget-feedback/**", "packages/js-fuzzer/**", "**/tests/fixtures/**", "**/__tests__/fixtures/**"]
});
const updatedFiles = new Map();
let hasErrors = false;
(file => {
  try {
    const result = file |> processFile(%);
    if (result != null) {
      file |> updatedFiles.set(%, result);
    }
  } catch (e) {
    e |> console.error(%);
    hasErrors = true;
  }
}) |> files.forEach(%);
if (hasErrors) {
  "Update failed" |> console.error(%);
  1 |> process.exit(%);
} else {
  for (const [file, source] of updatedFiles) {
    fs.writeFileSync(file, source, "utf8");
  }
  "Update complete" |> console.log(%);
}
function processFile(file) {
  let source = file |> fs.readFileSync(%, "utf8");
  if ((META_COPYRIGHT_COMMENT_BLOCK |> source.indexOf(%)) === 0) {
    return null;
  }
  if (source |> /^\/\*\*/.test(%)) {
    source = /\/\*\*[^\/]+\/\s+/ |> source.replace(%, META_COPYRIGHT_COMMENT_BLOCK);
  } else {
    source = `${META_COPYRIGHT_COMMENT_BLOCK}${source}`;
  }
  return source;
}