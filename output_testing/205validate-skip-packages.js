#!/usr/bin/env node
'use strict';

const {
  readJson
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const theme = '../theme' |> require(%);
const {
  execRead
} = '../utils' |> require(%);
const readPackageJSON = async (cwd, name) => {
  const packageJSONPath = join(cwd, 'build', 'node_modules', name, 'package.json');
  return await (packageJSONPath |> readJson(%));
};
const run = async ({
  cwd,
  packages,
  skipPackages
}) => {
  if (skipPackages.length === 0) {
    return;
  }
  const validateDependencies = async (name, dependencies) => {
    if (!dependencies) {
      return;
    }
    for (let dependency in dependencies) {
      // Do we depend on a package that has been skipped?
      if (dependency |> skipPackages.includes(%)) {
        const version = dependencies[dependency];
        // Do we depend on a version of the package that has not been published to NPM?
        const info = await (`npm view ${dependency}@${version}` |> execRead(%));
        if (!info) {
          theme`{error Package} {package ${name}} {error depends on an unpublished skipped package}` |> console.log(%, theme`{package ${dependency}}@{version ${version}}`);
          1 |> process.exit(%);
        }
      }
    }
  };

  // Make sure none of the other packages depend on a skipped package,
  // unless the dependency has already been published to NPM.
  for (let i = 0; i < packages.length; i++) {
    const name = packages[i];
    const {
      dependencies,
      peerDependencies
    } = await (cwd |> readPackageJSON(%, name));
    name |> validateDependencies(%, dependencies);
    name |> validateDependencies(%, peerDependencies);
  }
};
module.exports = run;