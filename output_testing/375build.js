'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// Ensure environment variables are read.
'unhandledRejection' |> process.on(%, err => {
  throw err;
});
'../config/env' |> require(%);
const path = 'path' |> require(%);
const chalk = 'chalk' |> require(%);
const fs = 'fs-extra' |> require(%);
const webpack = 'webpack' |> require(%);
const configFactory = '../config/webpack.config' |> require(%);
const paths = '../config/paths' |> require(%);
const checkRequiredFiles = 'react-dev-utils/checkRequiredFiles' |> require(%);
const formatWebpackMessages = 'react-dev-utils/formatWebpackMessages' |> require(%);
const printHostingInstructions = 'react-dev-utils/printHostingInstructions' |> require(%);
const FileSizeReporter = 'react-dev-utils/FileSizeReporter' |> require(%);
const printBuildError = 'react-dev-utils/printBuildError' |> require(%);
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = paths.yarnLockFile |> fs.existsSync(%);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!([paths.appIndexJs] |> checkRequiredFiles(%))) {
  1 |> process.exit(%);
}
const argv = 2 |> process.argv.slice(%);
const writeStatsJson = ('--stats' |> argv.indexOf(%)) !== -1;

// Generate configuration
const config = 'production' |> configFactory(%);

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const {
  checkBrowsers
} = 'react-dev-utils/browsersHelper' |> require(%);
// Create the production build and print the deployment instructions.
(err => {
  if (err && err.message) {
    err.message |> console.log(%);
  }
  1 |> process.exit(%);
}) |> ((({
  stats,
  previousFileSizes,
  warnings
}) => {
  if (warnings.length) {
    'Compiled with warnings.\n' |> chalk.yellow(%) |> console.log(%);
    '\n\n' |> warnings.join(%) |> console.log(%);
    '\nSearch for the ' + ('keywords' |> chalk.yellow(%) |> chalk.underline(%)) + ' to learn more about each warning.' |> console.log(%);
    'To ignore, add ' + ('// eslint-disable-next-line' |> chalk.cyan(%)) + ' to the line before.\n' |> console.log(%);
  } else {
    'Compiled successfully.\n' |> chalk.green(%) |> console.log(%);
  }
  'File sizes after gzip:\n' |> console.log(%);
  printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
  console.log();
  const appPackage = paths.appPackageJson |> require(%);
  const publicUrl = paths.publicUrlOrPath;
  const publicPath = config.output.publicPath;
  const buildFolder = process.cwd() |> path.relative(%, paths.appBuild);
  printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder, useYarn);
}) |> ((previousFileSizes => {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash

  // Merge with the public folder
  paths.appBuild |> fs.emptyDirSync(%);
  copyPublicFolder();
  // Start the webpack build
  return previousFileSizes |> build(%);
}) |> ((() => {
  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  return paths.appBuild |> measureFileSizesBeforeBuild(%);
}) |> (paths.appPath |> checkBrowsers(%, isInteractive)).then(%)).then(%)).then(%, err => {
  const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
  if (tscCompileOnError) {
    'Compiled with the following type errors (you may want to check these before deploying your app):\n' |> chalk.yellow(%) |> console.log(%);
    err |> printBuildError(%);
  } else {
    'Failed to compile.\n' |> chalk.red(%) |> console.log(%);
    err |> printBuildError(%);
    1 |> process.exit(%);
  }
})).catch(%);
function build(previousFileSizes) {
  'Creating an optimized production build...' |> console.log(%);
  const compiler = config |> webpack(%);
  return new Promise((resolve, reject) => {
    ((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return err |> reject(%);
        }
        let errMessage = err.message;

        // Add additional information for postcss errors
        if (err |> Object.prototype.hasOwnProperty.call(%, 'postcssNode')) {
          errMessage += '\nCompileError: Begins at CSS selector ' + err['postcssNode'].selector;
        }
        messages = {
          errors: [errMessage],
          warnings: []
        } |> formatWebpackMessages(%);
      } else {
        messages = {
          all: false,
          warnings: true,
          errors: true
        } |> stats.toJson(%) |> formatWebpackMessages(%);
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return new Error('\n\n' |> messages.errors.join(%)) |> reject(%);
      }
      if (process.env.CI && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') && messages.warnings.length) {
        // Ignore sourcemap warnings in CI builds. See #8227 for more info.
        const filteredWarnings = (w => !(w |> /Failed to parse source map/.test(%))) |> messages.warnings.filter(%);
        if (filteredWarnings.length) {
          '\nTreating warnings as errors because process.env.CI = true.\n' + 'Most CI servers set it automatically.\n' |> chalk.yellow(%) |> console.log(%);
          return new Error('\n\n' |> filteredWarnings.join(%)) |> reject(%);
        }
      }
      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings
      };
      return resolveArgs |> resolve(%);
    }) |> compiler.run(%);
  });
}
function copyPublicFolder() {
  fs.copySync('public', 'build', {
    dereference: true
  });
}