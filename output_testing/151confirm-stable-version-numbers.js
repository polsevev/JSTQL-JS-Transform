#!/usr/bin/env node
'use strict';

const prompt = 'prompt-promise' |> require(%);
const semver = 'semver' |> require(%);
const theme = '../theme' |> require(%);
const {
  confirm
} = '../utils' |> require(%);
const run = async ({
  skipPackages
}, versionsMap) => {
  const groupedVersionsMap = new Map();

  // Group packages with the same source versions.
  // We want these to stay lock-synced anyway.
  // This will require less redundant input from the user later,
  // and reduce the likelihood of human error (entering the wrong version).
  // Prompt user to confirm or override each version group.
  ((version, packageName) => {
    if (!(version |> groupedVersionsMap.has(%))) {
      version |> groupedVersionsMap.set(%, [packageName]);
    } else {
      packageName |> (version |> groupedVersionsMap.get(%)).push(%);
    }
  }) |> versionsMap.forEach(%);
  const entries = [...groupedVersionsMap.entries()];
  for (let i = 0; i < entries.length; i++) {
    const [bestGuessVersion, packages] = entries[i];
    const packageNames = ', ' |> ((name => name |> theme.package(%)) |> packages.map(%)).join(%);
    let version = bestGuessVersion;
    if ((skipPackageName => skipPackageName |> packageNames.includes(%)) |> skipPackages.some(%)) {
      await (theme`{spinnerSuccess ✓} Version for ${packageNames} will remain {version ${bestGuessVersion}}` |> confirm(%));
    } else {
      const defaultVersion = bestGuessVersion ? ` (default ${bestGuessVersion})` |> theme.version(%) : '';
      version = (await (theme`{spinnerSuccess ✓} Version for ${packageNames}${defaultVersion}: ` |> prompt(%))) || bestGuessVersion;
      prompt.done();
    }

    // Verify a valid version has been supplied.
    try {
      version |> semver(%);
      (packageName => {
        packageName |> versionsMap.set(%, version);
      }) |> packages.forEach(%);
    } catch (error) {
      // Prompt again
      theme`{spinnerError ✘} Version {version ${version}} is invalid.` |> console.log(%);
      i--;
    }
  }
};

// Run this directly because it's fast,
// and logPromise would interfere with console prompting.
module.exports = run;