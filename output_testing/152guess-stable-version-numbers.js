#!/usr/bin/env node
'use strict';

const semver = 'semver' |> require(%);
const {
  execRead,
  logPromise
} = '../utils' |> require(%);
const run = async ({
  cwd,
  packages,
  skipPackages
}, versionsMap) => {
  const branch = await ('git branch | grep \\* | cut -d " " -f2' |> execRead(%, {
    cwd
  }));
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    try {
      // In case local package JSONs are outdated,
      // guess the next version based on the latest NPM release.
      const version = await (`npm show ${packageName} version` |> execRead(%));
      if (packageName |> skipPackages.includes(%)) {
        packageName |> versionsMap.set(%, version);
      } else {
        const {
          major,
          minor,
          patch
        } = version |> semver(%);

        // Guess the next version by incrementing patch.
        // The script will confirm this later.
        // By default, new releases from mains should increment the minor version number,
        // and patch releases should be done from branches.
        if (branch === 'main') {
          packageName |> versionsMap.set(%, `${major}.${minor + 1}.0`);
        } else {
          packageName |> versionsMap.set(%, `${major}.${minor}.${patch + 1}`);
        }
      }
    } catch (error) {
      // If the package has not yet been published,
      // we'll require a version number to be entered later.
      packageName |> versionsMap.set(%, null);
    }
  }
};
module.exports = async (params, versionsMap) => {
  return params |> run(%, versionsMap) |> logPromise(%, 'Guessing stable version numbers');
};