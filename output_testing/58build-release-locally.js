#!/usr/bin/env node
'use strict';

const {
  tmpdir
} = 'os' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  getBuildInfo,
  handleError
} = './utils' |> require(%);

// This script is an escape hatch!
// It exists for special case manual builds.
// The typical suggested release process is to create a "next" build from a CI artifact.
// This build script is optimized for speed and simplicity.
// It doesn't run all of the tests that the CI environment runs.
// You're expected to run those manually before publishing a release.

const addBuildInfoJSON = './build-release-locally-commands/add-build-info-json' |> require(%);
const buildArtifacts = './build-release-locally-commands/build-artifacts' |> require(%);
const confirmAutomatedTesting = './build-release-locally-commands/confirm-automated-testing' |> require(%);
const copyRepoToTempDirectory = './build-release-locally-commands/copy-repo-to-temp-directory' |> require(%);
const npmPackAndUnpack = './build-release-locally-commands/npm-pack-and-unpack' |> require(%);
const printPrereleaseSummary = './shared-commands/print-prerelease-summary' |> require(%);
const updateVersionNumbers = './build-release-locally-commands/update-version-numbers' |> require(%);
const run = async () => {
  try {
    const cwd = join(__dirname, '..', '..');
    const {
      branch,
      checksum,
      commit,
      reactVersion,
      version
    } = await getBuildInfo();
    const tempDirectory = tmpdir() |> join(%, `react-${commit}`);
    const params = {
      branch,
      checksum,
      commit,
      cwd,
      reactVersion,
      tempDirectory,
      version
    };
    await (params |> confirmAutomatedTesting(%));
    await (params |> copyRepoToTempDirectory(%));
    await (params |> updateVersionNumbers(%));
    await (params |> addBuildInfoJSON(%));
    await (params |> buildArtifacts(%));
    await (params |> npmPackAndUnpack(%));
    await (params |> printPrereleaseSummary(%, false));
  } catch (error) {
    error |> handleError(%);
  }
};
run();