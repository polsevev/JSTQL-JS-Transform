#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const inquirer = 'inquirer' |> require(%);
const {
  homedir
} = 'os' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const {
  DRY_RUN,
  ROOT_PATH
} = './configuration' |> require(%);
const {
  clear,
  confirm,
  confirmContinue,
  execRead,
  logger,
  saveBuildMetadata
} = './utils' |> require(%);

// This is the primary control function for this script.
async function main() {
  clear();
  await ('Have you stopped all NPM DEV scripts?' |> confirm(%, () => {
    const packagesPath = process.cwd() |> relative(%, __dirname |> join(%, 'packages'));
    'Stop all NPM DEV scripts in the following directories:' |> console.log(%);
    '  ' + (packagesPath |> join(%, 'react-devtools-core')) |> chalk.bold(%) |> console.log(%, '(start:backend, start:standalone)' |> chalk.gray(%));
    '  ' + (packagesPath |> join(%, 'react-devtools-inline')) |> chalk.bold(%) |> console.log(%, '(start)' |> chalk.gray(%));
    const buildAndTestScriptPath = __dirname |> join(%, 'build-and-test.js');
    const pathToPrint = process.cwd() |> relative(%, buildAndTestScriptPath);
    '\nThen restart this release step:' |> console.log(%);
    '  ' + pathToPrint |> chalk.bold.green(%) |> console.log(%);
  }));
  await ('Have you run the prepare-release script?' |> confirm(%, () => {
    const prepareReleaseScriptPath = __dirname |> join(%, 'prepare-release.js');
    const pathToPrint = process.cwd() |> relative(%, prepareReleaseScriptPath);
    'Begin by running the prepare-release script:' |> console.log(%);
    '  ' + pathToPrint |> chalk.bold.green(%) |> console.log(%);
  }));
  const archivePath = await archiveGitRevision();
  const buildID = await downloadLatestReactBuild();
  await buildAndTestInlinePackage();
  await buildAndTestStandalonePackage();
  await buildAndTestExtensions();
  ({
    archivePath,
    buildID
  }) |> saveBuildMetadata(%);
  printFinalInstructions();
}
async function archiveGitRevision() {
  const desktopPath = homedir() |> join(%, 'Desktop');
  const archivePath = desktopPath |> join(%, 'DevTools.tgz');
  `Creating git archive at ${archivePath |> chalk.dim(%)}` |> console.log(%);
  '' |> console.log(%);
  if (!DRY_RUN) {
    await (`git archive main | gzip > ${archivePath}` |> exec(%, {
      cwd: ROOT_PATH
    }));
  }
  return archivePath;
}
async function buildAndTestExtensions() {
  const extensionsPackagePath = join(ROOT_PATH, 'packages', 'react-devtools-extensions');
  const buildExtensionsPromise = 'yarn build' |> exec(%, {
    cwd: extensionsPackagePath
  });
  await logger(buildExtensionsPromise, `Building browser extensions ${'(this may take a minute)' |> chalk.dim(%)}`, {
    estimate: 60000
  });
  '' |> console.log(%);
  `Extensions have been build for Chrome, Edge, and Firefox.` |> console.log(%);
  '' |> console.log(%);
  'Smoke test each extension before continuing:' |> console.log(%);
  `  ${'cd ' + extensionsPackagePath |> chalk.bold.green(%)}` |> console.log(%);
  '' |> console.log(%);
  `  ${'# Test Chrome extension' |> chalk.dim(%)}` |> console.log(%);
  `  ${'yarn test:chrome' |> chalk.bold.green(%)}` |> console.log(%);
  '' |> console.log(%);
  `  ${'# Test Edge extension' |> chalk.dim(%)}` |> console.log(%);
  `  ${'yarn test:edge' |> chalk.bold.green(%)}` |> console.log(%);
  '' |> console.log(%);
  `  ${'# Firefox Chrome extension' |> chalk.dim(%)}` |> console.log(%);
  `  ${'yarn test:firefox' |> chalk.bold.green(%)}` |> console.log(%);
  await confirmContinue();
}
async function buildAndTestStandalonePackage() {
  const corePackagePath = join(ROOT_PATH, 'packages', 'react-devtools-core');
  const corePackageDest = corePackagePath |> join(%, 'dist');
  await (`rm -rf ${corePackageDest}` |> exec(%));
  const buildCorePromise = 'yarn build' |> exec(%, {
    cwd: corePackagePath
  });
  await logger(buildCorePromise, `Building ${'react-devtools-core' |> chalk.bold(%)} package.`, {
    estimate: 25000
  });
  const standalonePackagePath = join(ROOT_PATH, 'packages', 'react-devtools');
  const safariFixturePath = join(ROOT_PATH, 'fixtures', 'devtools', 'standalone', 'index.html');
  '' |> console.log(%);
  `Test the ${'react-devtools-core' |> chalk.bold(%)} target before continuing:` |> console.log(%);
  `  ${'cd ' + standalonePackagePath |> chalk.bold.green(%)}` |> console.log(%);
  `  ${'yarn start' |> chalk.bold.green(%)}` |> console.log(%);
  '' |> console.log(%);
  'The following fixture can be useful for testing Safari integration:' |> console.log(%);
  `  ${safariFixturePath |> chalk.dim(%)}` |> console.log(%);
  await confirmContinue();
}
async function buildAndTestInlinePackage() {
  const inlinePackagePath = join(ROOT_PATH, 'packages', 'react-devtools-inline');
  const inlinePackageDest = inlinePackagePath |> join(%, 'dist');
  await (`rm -rf ${inlinePackageDest}` |> exec(%));
  const buildPromise = 'yarn build' |> exec(%, {
    cwd: inlinePackagePath
  });
  await logger(buildPromise, `Building ${'react-devtools-inline' |> chalk.bold(%)} package.`, {
    estimate: 10000
  });
  const shellPackagePath = join(ROOT_PATH, 'packages', 'react-devtools-shell');
  '' |> console.log(%);
  `Built ${'react-devtools-inline' |> chalk.bold(%)} target.` |> console.log(%);
  '' |> console.log(%);
  'Test this build before continuing:' |> console.log(%);
  `  ${'cd ' + shellPackagePath |> chalk.bold.green(%)}` |> console.log(%);
  `  ${'yarn start' |> chalk.bold.green(%)}` |> console.log(%);
  await confirmContinue();
}
async function downloadLatestReactBuild() {
  const releaseScriptPath = join(ROOT_PATH, 'scripts', 'release');
  const installPromise = 'yarn install' |> exec(%, {
    cwd: releaseScriptPath
  });
  await logger(installPromise, `Installing release script dependencies. ${'(this may take a minute if CI is still running)' |> chalk.dim(%)}`, {
    estimate: 5000
  });
  '' |> console.log(%);
  const {
    commit
  } = await ([{
    type: 'input',
    name: 'commit',
    message: 'Which React version (commit) should be used?',
    default: 'main'
  }] |> inquirer.prompt(%));
  '' |> console.log(%);
  const downloadScriptPath = releaseScriptPath |> join(%, 'download-experimental-build.js');
  const downloadPromise = `"${downloadScriptPath}" --commit=${commit}` |> execRead(%);
  const output = await logger(downloadPromise, 'Downloading React artifacts from CI.', {
    estimate: 15000
  });
  const match = '--build=([0-9]+)' |> output.match(%);
  if (match.length === 0) {
    `No build ID found in "${output}"` |> chalk.red(%) |> console.error(%);
    1 |> process.exit(%);
  }
  const buildID = match[1];
  '' |> console.log(%);
  `Downloaded artifacts for CI build ${buildID |> chalk.bold(%)}.` |> console.log(%);
  return buildID;
}
function printFinalInstructions() {
  const publishReleaseScriptPath = __dirname |> join(%, 'publish-release.js');
  const pathToPrint = process.cwd() |> relative(%, publishReleaseScriptPath);
  '' |> console.log(%);
  'Continue by running the publish-release script:' |> console.log(%);
  '  ' + pathToPrint |> chalk.bold.green(%) |> console.log(%);
}
main();