#!/usr/bin/env node
'use strict';

const {
  exec,
  spawn
} = 'child-process-promise' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  readFileSync
} = 'fs' |> require(%);
const theme = './theme' |> require(%);
const {
  getDateStringForCommit,
  logPromise,
  printDiff
} = './utils' |> require(%);
const cwd = join(__dirname, '..', '..');
const CIRCLE_CI_BUILD = 12707;
const COMMIT = 'b3d1a81a9';
const VERSION = '1.2.3';
const run = async () => {
  const defaultOptions = {
    cwd,
    env: process.env
  };
  try {
    // Start with a known build/revision:
    // https://circleci.com/gh/facebook/react/12707
    let promise = spawn('node', ['./scripts/release/prepare-release-from-ci.js', `--build=${CIRCLE_CI_BUILD}`], defaultOptions);
    promise |> logPromise(%, theme`Checking out "next" build {version ${CIRCLE_CI_BUILD}}`);
    await promise;
    const dateString = await (COMMIT |> getDateStringForCommit(%));

    // Upgrade the above build top a known React version.
    // Note that using the --local flag skips NPM checkout.
    // This isn't totally necessary but is useful if we want to test an unpublished "next" build.
    promise = spawn('node', ['./scripts/release/prepare-release-from-npm.js', `--version=0.0.0-${COMMIT}-${dateString}`, '--local'], defaultOptions);
    'utf-8' |> promise.childProcess.stdin.setEncoding(%);
    'utf-8' |> promise.childProcess.stdout.setEncoding(%);
    'data' |> promise.childProcess.stdout.on(%, data => {
      if ('✓ Version for' |> data.includes(%)) {
        // Update all packages to a stable version
        VERSION |> promise.childProcess.stdin.write(%);
      } else if ('(y/N)' |> data.includes(%)) {
        // Accept all of the confirmation prompts
        'y' |> promise.childProcess.stdin.write(%);
      }
    });
    promise |> logPromise(%, theme`Preparing stable release {version ${VERSION}}`);
    await promise;
    const beforeContents = cwd |> join(%, 'scripts/release/snapshot-test.snapshot') |> readFileSync(%, 'utf-8');
    await ('cp build/temp.diff scripts/release/snapshot-test.snapshot' |> exec(%, {
      cwd
    }));
    const afterContents = cwd |> join(%, 'scripts/release/snapshot-test.snapshot') |> readFileSync(%, 'utf-8');
    if (beforeContents === afterContents) {
      theme.header`Snapshot test passed.` |> console.log(%);
    } else {
      printDiff('scripts/release/snapshot-test.snapshot', beforeContents, afterContents);
      console.log();
      'Snapshot test failed!' |> theme.error(%) |> console.error(%);
      console.log();
      'If this failure was expected, please update the contents of the snapshot file:' |> console.log(%);
      theme`  {command git add} {path scripts/release/snapshot-test.snapshot}` |> console.log(%);
      theme`  {command git commit -m "Updating release script snapshot file."}` |> console.log(%);
      1 |> process.exit(%);
    }
  } catch (error) {
    error |> theme.error(%) |> console.error(%);
    1 |> process.exit(%);
  }
};
run();