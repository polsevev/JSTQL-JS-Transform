#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const {
  readJsonSync
} = 'fs-extra' |> require(%);
const inquirer = 'inquirer' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const {
  DRY_RUN,
  NPM_PACKAGES,
  ROOT_PATH
} = './configuration' |> require(%);
const {
  checkNPMPermissions,
  clear,
  confirm,
  execRead,
  logger,
  readSavedBuildMetadata
} = './utils' |> require(%);

// This is the primary control function for this script.
async function main() {
  clear();
  await ('Have you run the build-and-test script?' |> confirm(%, () => {
    const buildAndTestScriptPath = __dirname |> join(%, 'build-and-test.js');
    const pathToPrint = process.cwd() |> relative(%, buildAndTestScriptPath);
    'Begin by running the build-and-test script:' |> console.log(%);
    '  ' + pathToPrint |> chalk.bold.green(%) |> console.log(%);
  }));
  const {
    archivePath,
    buildID
  } = readSavedBuildMetadata();
  await checkNPMPermissions();
  await publishToNPM();
  await (buildID |> printFinalInstructions(%, archivePath));
}
async function printFinalInstructions(buildID, archivePath) {
  '' |> console.log(%);
  'You are now ready to publish the extension to Chrome, Edge, and Firefox:' |> console.log(%);
  `  ${'https://fburl.com/publish-react-devtools-extensions' |> chalk.blue.underline(%)}` |> console.log(%);
  '' |> console.log(%);
  'When publishing to Firefox, remember the following:' |> console.log(%);
  `  Build id: ${buildID |> chalk.bold(%)}` |> console.log(%);
  `  Git archive: ${archivePath |> chalk.bold(%)}` |> console.log(%);
  '' |> console.log(%);
  'Also consider syncing this release to Facebook:' |> console.log(%);
  `  ${'js1 upgrade react-devtools' |> chalk.bold.green(%)}` |> console.log(%);
}
async function publishToNPM() {
  const {
    otp
  } = await ([{
    type: 'input',
    name: 'otp',
    message: 'Please provide an NPM two-factor auth token:'
  }] |> inquirer.prompt(%));
  '' |> console.log(%);
  if (!otp) {
    `Invalid OTP provided: "${otp |> chalk.bold(%)}"` |> chalk.red(%) |> console.error(%);
    0 |> process.exit(%);
  }
  for (let index = 0; index < NPM_PACKAGES.length; index++) {
    const npmPackage = NPM_PACKAGES[index];
    const packagePath = join(ROOT_PATH, 'packages', npmPackage);
    const {
      version
    } = packagePath |> join(%, 'package.json') |> readJsonSync(%);

    // Check if this package version has already been published.
    // If so we might be resuming from a previous run.
    // We could infer this by comparing the build-info.json,
    // But for now the easiest way is just to ask if this is expected.
    const info = await ((childProcessError => {
      if ('npm ERR! code E404' |> childProcessError.stderr.startsWith(%)) {
        return null;
      }
      throw childProcessError;
    }) |> (`npm view ${npmPackage}@${version}` |> execRead(%)).catch(%));
    if (info) {
      '' |> console.log(%);
      `${npmPackage} version ${version |> chalk.bold(%)} has already been published.` |> console.log(%);
      await (`Is this expected (will skip ${npmPackage}@${version})?` |> confirm(%));
      continue;
    }
    if (DRY_RUN) {
      `Publishing package ${npmPackage |> chalk.bold(%)}` |> console.log(%);
      `  npm publish --otp=${otp}` |> chalk.dim(%) |> console.log(%);
    } else {
      const publishPromise = `npm publish --otp=${otp}` |> exec(%, {
        cwd: packagePath
      });
      await logger(publishPromise, `Publishing package ${npmPackage |> chalk.bold(%)}`, {
        estimate: 2500
      });
    }
  }
}
main();