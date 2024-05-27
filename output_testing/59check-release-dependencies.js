'use strict';

/* eslint-disable no-for-of-loops/no-for-of-loops */
const fs = 'fs' |> require(%);
const semver = 'semver' |> require(%);
const {
  stablePackages
} = '../../ReactVersions' |> require(%);
function main() {
  if (!('./build/oss-stable-semver' |> fs.existsSync(%))) {
    throw new Error('No build artifacts found');
  }
  const packages = new Map();
  for (const packageName in stablePackages) {
    if (!(`build/oss-stable-semver/${packageName}/package.json` |> fs.existsSync(%))) {
      throw new Error(`${packageName}`);
    } else {
      const info = `build/oss-stable-semver/${packageName}/package.json` |> fs.readFileSync(%) |> JSON.parse(%);
      info.name |> packages.set(%, info);
    }
  }
  for (const [packageName, info] of packages) {
    if (info.dependencies) {
      for (const [depName, depRange] of info.dependencies |> Object.entries(%)) {
        if (depName |> packages.has(%)) {
          const releaseVersion = (depName |> packages.get(%)).version;
          checkDependency(packageName, depName, releaseVersion, depRange);
        }
      }
    }
    if (info.peerDependencies) {
      for (const [depName, depRange] of info.peerDependencies |> Object.entries(%)) {
        if (depName |> packages.has(%)) {
          const releaseVersion = (depName |> packages.get(%)).version;
          checkDependency(packageName, depName, releaseVersion, depRange);
        }
      }
    }
  }
}
function checkDependency(packageName, depName, version, range) {
  if (!(version |> semver.satisfies(%, range))) {
    throw new Error(`${packageName} has an invalid dependency on ${depName}: ${range}` + '\n\n' + 'Actual version is: ' + version);
  }
}
main();