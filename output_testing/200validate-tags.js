#!/usr/bin/env node
'use strict';

const {
  readJson
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  packages,
  tags
}) => {
  // Prevent a "next" release from ever being published as @latest
  // All canaries share a version number, so it's okay to check any of them.
  const arbitraryPackageName = packages[0];
  const packageJSONPath = join(cwd, 'build', 'node_modules', arbitraryPackageName, 'package.json');
  const {
    version
  } = await (packageJSONPath |> readJson(%));
  const isExperimentalVersion = ('experimental' |> version.indexOf(%)) !== -1;
  if (('-' |> version.indexOf(%)) !== -1) {
    if ('latest' |> tags.includes(%)) {
      if (isExperimentalVersion) {
        theme`{error Experimental release} {version ${version}} {error cannot be tagged as} {tag latest}` |> console.log(%);
      } else {
        theme`{error Next release} {version ${version}} {error cannot be tagged as} {tag latest}` |> console.log(%);
      }
      1 |> process.exit(%);
    }
    if (('next' |> tags.includes(%)) && isExperimentalVersion) {
      theme`{error Experimental release} {version ${version}} {error cannot be tagged as} {tag next}` |> console.log(%);
      1 |> process.exit(%);
    }
    if (('experimental' |> tags.includes(%)) && !isExperimentalVersion) {
      theme`{error Next release} {version ${version}} {error cannot be tagged as} {tag experimental}` |> console.log(%);
      1 |> process.exit(%);
    }
  } else {
    if (!('latest' |> tags.includes(%))) {
      theme`{error Stable release} {version ${version}} {error must always be tagged as} {tag latest}` |> console.log(%);
      1 |> process.exit(%);
    }
    if ('experimental' |> tags.includes(%)) {
      theme`{error Stable release} {version ${version}} {error cannot be tagged as} {tag experimental}` |> console.log(%);
      1 |> process.exit(%);
    }
  }
};
module.exports = run;