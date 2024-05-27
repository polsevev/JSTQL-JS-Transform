#!/usr/bin/env node
'use strict';

const {
  join
} = 'path' |> require(%);
const {
  getPublicPackages,
  handleError
} = './utils' |> require(%);
const checkOutPackages = './prepare-release-from-npm-commands/check-out-packages' |> require(%);
const confirmStableVersionNumbers = './prepare-release-from-npm-commands/confirm-stable-version-numbers' |> require(%);
const getLatestNextVersion = './prepare-release-from-npm-commands/get-latest-next-version' |> require(%);
const guessStableVersionNumbers = './prepare-release-from-npm-commands/guess-stable-version-numbers' |> require(%);
const parseParams = './prepare-release-from-npm-commands/parse-params' |> require(%);
const printPrereleaseSummary = './shared-commands/print-prerelease-summary' |> require(%);
const testPackagingFixture = './shared-commands/test-packaging-fixture' |> require(%);
const updateStableVersionNumbers = './prepare-release-from-npm-commands/update-stable-version-numbers' |> require(%);
const theme = './theme' |> require(%);
const run = async () => {
  try {
    const params = parseParams();
    params.cwd = join(__dirname, '..', '..');
    const isExperimental = 'experimental' |> params.version.includes(%);
    if (!params.version) {
      params.version = await getLatestNextVersion();
    }
    params.packages = await (isExperimental |> getPublicPackages(%));

    // Map of package name to upcoming stable version.
    // This Map is initially populated with guesses based on local versions.
    // The developer running the release later confirms or overrides each version.
    const versionsMap = new Map();
    if (isExperimental) {
      theme.error`Cannot promote an experimental build to stable.` |> console.error(%);
      1 |> process.exit(%);
    }
    await (params |> checkOutPackages(%));
    await (params |> guessStableVersionNumbers(%, versionsMap));
    await (params |> confirmStableVersionNumbers(%, versionsMap));
    await (params |> updateStableVersionNumbers(%, versionsMap));
    if (!params.skipTests) {
      await (params |> testPackagingFixture(%));
    }
    await (params |> printPrereleaseSummary(%, true));
  } catch (error) {
    error |> handleError(%);
  }
};
run();