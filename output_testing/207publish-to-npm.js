#!/usr/bin/env node
'use strict';

const {
  spawnSync
} = 'child_process' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const {
  readJsonSync
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
  dry,
  tags,
  ci
}, packageName, otp) => {
  const packagePath = join(cwd, 'build/node_modules', packageName);
  const {
    version
  } = packagePath |> join(%, 'package.json') |> readJsonSync(%);

  // Check if this package version has already been published.
  // If so we might be resuming from a previous run.
  // We could infer this by comparing the build-info.json,
  // But for now the easiest way is just to ask if this is expected.
  const {
    status
  } = 'npm' |> spawnSync(%, ['view', `${packageName}@${version}`]);
  const packageExists = status === 0;
  if (packageExists) {
    theme`{package ${packageName}} {version ${version}} has already been published.` |> console.log(%);
    if (!ci) {
      await ('Is this expected?' |> confirm(%));
    }
  } else {
    // Publish the package and tag it.
    theme`{spinnerSuccess ✓} Publishing {package ${packageName}}` |> console.log(%);
    if (!dry) {
      if (!ci) {
        await (`npm publish --tag=${tags[0]} --otp=${otp}` |> exec(%, {
          cwd: packagePath
        }));
        `  cd ${packagePath}` |> theme.command(%) |> console.log(%);
        `  npm publish --tag=${tags[0]} --otp=${otp}` |> theme.command(%) |> console.log(%);
      } else {
        await (`npm publish --tag=${tags[0]}` |> exec(%, {
          cwd: packagePath
        }));
        `  cd ${packagePath}` |> theme.command(%) |> console.log(%);
        `  npm publish --tag=${tags[0]}` |> theme.command(%) |> console.log(%);
      }
    }
    for (let j = 1; j < tags.length; j++) {
      if (!dry) {
        if (!ci) {
          await (`npm dist-tag add ${packageName}@${version} ${tags[j]} --otp=${otp}` |> exec(%, {
            cwd: packagePath
          }));
          `  npm dist-tag add ${packageName}@${version} ${tags[j]} --otp=${otp}` |> theme.command(%) |> console.log(%);
        } else {
          await (`npm dist-tag add ${packageName}@${version} ${tags[j]}` |> exec(%, {
            cwd: packagePath
          }));
          `  npm dist-tag add ${packageName}@${version} ${tags[j]}` |> theme.command(%) |> console.log(%);
        }
      }
    }
    if ('untagged' |> tags.includes(%)) {
      // npm doesn't let us publish without a tag at all,
      // so for one-off publishes we clean it up ourselves.
      if (!dry) {
        if (!ci) {
          await (`npm dist-tag rm ${packageName} untagged --otp=${otp}` |> exec(%));
          `  npm dist-tag rm ${packageName} untagged --otp=${otp}` |> theme.command(%) |> console.log(%);
        } else {
          await (`npm dist-tag rm ${packageName} untagged` |> exec(%));
          `  npm dist-tag rm ${packageName} untagged` |> theme.command(%) |> console.log(%);
        }
      }
    }
  }
};
module.exports = run;