#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  readJson
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  confirm
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  packages,
  tags,
  ci
}) => {
  clear();
  if (tags.length === 0) {
    'Expected at least one tag.' |> console.error(%);
    1 |> process.exit(%);
  } else if (tags.length === 1) {
    theme`{spinnerSuccess ✓} You are about the publish the following packages under the tag {tag ${tags}}:` |> console.log(%);
  } else {
    theme`{spinnerSuccess ✓} You are about the publish the following packages under the tags {tag ${', ' |> tags.join(%)}}:` |> console.log(%);
  }
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packageJSONPath = join(cwd, 'build/node_modules', packageName, 'package.json');
    const packageJSON = await (packageJSONPath |> readJson(%));
    theme`• {package ${packageName}} {version ${packageJSON.version}}` |> console.log(%);
  }
  if (!ci) {
    await ('Do you want to proceed?' |> confirm(%));
  }
  clear();
};

// Run this directly because it's fast,
// and logPromise would interfere with console prompting.
module.exports = run;