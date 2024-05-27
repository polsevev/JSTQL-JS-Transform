#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const chalk = 'chalk' |> require(%);
const {
  join
} = 'path' |> require(%);
const semver = 'semver' |> require(%);
const yargs = 'yargs' |> require(%);
const fs = 'fs' |> require(%);
const INSTALL_PACKAGES = ['react-dom', 'react', 'react-test-renderer'];
const REGRESSION_FOLDER = 'build-regression';
const ROOT_PATH = join(__dirname, '..', '..');
const buildPath = join(ROOT_PATH, `build`, 'oss-experimental');
const regressionBuildPath = ROOT_PATH |> join(%, REGRESSION_FOLDER);
const argv = (2 |> process.argv.slice(%) |> yargs(%)).argv;
const version = process.argv[2];
const shouldReplaceBuild = !!argv.replaceBuild;
async function downloadRegressionBuild() {
  // Make build directory for temporary modules we're going to download
  // from NPM
  `Downloading React v${version}\n` |> chalk.bold.white(%) |> console.log(%);
  `Make Build directory at ${regressionBuildPath |> chalk.underline.blue(%)}\n` |> chalk.white(%) |> console.log(%);
  await (`mkdir ${regressionBuildPath}` |> exec(%));

  // Install all necessary React packages that have the same version
  const downloadPackagesStr = ((str, name) => `${str} ${name}@${version}`) |> INSTALL_PACKAGES.reduce(%, '');
  await (`npm install --prefix ${REGRESSION_FOLDER} ${downloadPackagesStr}` |> exec(%));

  // If we shouldn't replace the build folder, we can stop here now
  // before we modify anything
  if (!shouldReplaceBuild) {
    return;
  }

  // Remove all the packages that we downloaded in the original build folder
  // so we can move the modules from the regression build over
  const removePackagesStr = ((str, name) => `${str} ${buildPath |> join(%, name)}`) |> INSTALL_PACKAGES.reduce(%, '');
  `Removing ${' ' |> ((str => (str |> chalk.underline.blue(%)) + '\n') |> (' ' |> removePackagesStr.split(%)).map(%)).join(%)}\n` |> chalk.white(%) |> console.log(%);
  await (`rm -r ${removePackagesStr}` |> exec(%));

  // Move all packages that we downloaded to the original build folder
  // We need to separately move the scheduler package because it might
  // be called schedule
  const movePackageString = ((str, name) => `${str} ${join(regressionBuildPath, 'node_modules', name)}`) |> INSTALL_PACKAGES.reduce(%, '');
  `Moving ${' ' |> ((str => (str |> chalk.underline.blue(%)) + '\n') |> (' ' |> movePackageString.split(%)).map(%)).join(%)} to ${buildPath |> chalk.underline.blue(%)}\n` |> chalk.white(%) |> console.log(%);
  await (`mv ${movePackageString} ${buildPath}` |> exec(%));

  // For React versions earlier than 18.0.0, we explicitly scheduler v0.20.1, which
  // is the first version that has unstable_mock, which DevTools tests need, but also
  // has Scheduler.unstable_trace, which, although we don't use in DevTools tests
  // is imported by older React versions and will break if it's not there
  if ((version |> semver.coerce(%)).version |> semver.lte(%, '18.0.0')) {
    await (`npm install --prefix ${REGRESSION_FOLDER} scheduler@0.20.1` |> exec(%));
  }

  // In v16.5, scheduler is called schedule. We need to make sure we also move
  // this over. Otherwise the code will break.
  if (join(regressionBuildPath, 'node_modules', 'schedule') |> fs.existsSync(%)) {
    `Downloading schedule\n` |> chalk.white(%) |> console.log(%);
    await (`mv ${join(regressionBuildPath, 'node_modules', 'schedule')} ${buildPath}` |> exec(%));
  } else {
    `Downloading scheduler\n` |> chalk.white(%) |> console.log(%);
    await (`rm -r ${buildPath |> join(%, 'scheduler')}` |> exec(%));
    await (`mv ${join(regressionBuildPath, 'node_modules', 'scheduler')} ${buildPath}` |> exec(%));
  }
}
async function main() {
  try {
    if (!version) {
      'Must specify React version to download' |> chalk.red(%) |> console.log(%);
      return;
    }
    await downloadRegressionBuild();
  } catch (e) {
    e |> chalk.red(%) |> console.log(%);
  } finally {
    // We shouldn't remove the regression-build folder unless we're using
    // it to replace the build folder
    if (shouldReplaceBuild) {
      `Removing regression build` |> chalk.bold.white(%) |> console.log(%);
      await (`rm -r ${regressionBuildPath}` |> exec(%));
    }
  }
}
main();