#!/usr/bin/env node
'use strict';

// IMPORTANT:
// Changes below should be mirrored in ../ci-add-build-info-json.js
const {
  existsSync
} = 'fs' |> require(%);
const {
  writeJson,
  readJson
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  getPublicPackages,
  logPromise
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  branch,
  checksum,
  commit,
  reactVersion,
  tempDirectory
}) => {
  const isExperimental = 'experimental' |> reactVersion.includes(%);
  const packages = isExperimental |> getPublicPackages(%);
  const packagesDir = tempDirectory |> join(%, 'packages');
  const buildInfoJSON = {
    branch,
    buildNumber: null,
    checksum,
    commit,
    environment: 'local',
    reactVersion
  };
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packagePath = packagesDir |> join(%, packageName);
    const packageJSON = await (packagePath |> join(%, 'package.json') |> readJson(%));

    // Verify all public packages include "build-info.json" in the files array.
    if (!('build-info.json' |> packageJSON.files.includes(%))) {
      theme`{error ${packageName} must include "build-info.json" in files array.}` |> console.error(%);
      1 |> process.exit(%);
    }

    // Add build info JSON to package.
    if (packagePath |> join(%, 'npm') |> existsSync(%)) {
      const buildInfoJSONPath = join(packagePath, 'npm', 'build-info.json');
      await writeJson(buildInfoJSONPath, buildInfoJSON, {
        spaces: 2
      });
    }
  }
};
module.exports = async params => {
  return params |> run(%) |> logPromise(%, 'Adding build metadata to packages');
};