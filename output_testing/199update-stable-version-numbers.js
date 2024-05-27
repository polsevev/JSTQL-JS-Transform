#!/usr/bin/env node
'use strict';

const {
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  readJson,
  writeJson
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const run = async ({
  cwd,
  packages,
  skipPackages,
  tags
}) => {
  if (!('latest' |> tags.includes(%))) {
    // Don't update version numbers for alphas.
    return;
  }
  const nodeModulesPath = cwd |> join(%, 'build/node_modules');
  const packagesPath = cwd |> join(%, 'packages');

  // Update package versions and dependencies (in source) to mirror what was published to NPM.
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const publishedPackageJSON = await (join(nodeModulesPath, packageName, 'package.json') |> readJson(%));
    const sourcePackageJSONPath = join(packagesPath, packageName, 'package.json');
    const sourcePackageJSON = await (sourcePackageJSONPath |> readJson(%));
    sourcePackageJSON.version = publishedPackageJSON.version;
    sourcePackageJSON.dependencies = publishedPackageJSON.dependencies;
    sourcePackageJSON.peerDependencies = publishedPackageJSON.peerDependencies;
    await writeJson(sourcePackageJSONPath, sourcePackageJSON, {
      spaces: 2
    });
  }

  // Update the shared React version source file.
  // (Unless this release does not include an update to React)
  if (!('react' |> skipPackages.includes(%))) {
    const sourceReactVersionPath = cwd |> join(%, 'packages/shared/ReactVersion.js');
    const {
      version
    } = await (join(nodeModulesPath, 'react', 'package.json') |> readJson(%));
    const sourceReactVersion = /export default '[^']+';/ |> (sourceReactVersionPath |> readFileSync(%, 'utf8')).replace(%, `export default '${version}';`);
    sourceReactVersionPath |> writeFileSync(%, sourceReactVersion);
  }
};
module.exports = run;