#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  readJson,
  writeJson
} = 'fs-extra' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const {
  confirm,
  execRead,
  printDiff
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  packages,
  version
}, versionsMap) => {
  const nodeModulesPath = cwd |> join(%, 'build/node_modules');

  // Cache all package JSONs for easy lookup below.
  const sourcePackageJSONs = new Map();
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const sourcePackageJSON = await (join(cwd, 'packages', packageName, 'package.json') |> readJson(%));
    packageName |> sourcePackageJSONs.set(%, sourcePackageJSON);
  }
  const updateDependencies = async (targetPackageJSON, key) => {
    const targetDependencies = targetPackageJSON[key];
    if (targetDependencies) {
      const sourceDependencies = (targetPackageJSON.name |> sourcePackageJSONs.get(%))[key];
      for (let i = 0; i < packages.length; i++) {
        const dependencyName = packages[i];
        const targetDependency = targetDependencies[dependencyName];
        if (targetDependency) {
          // For example, say we're updating react-dom's dependency on scheduler.
          // We compare source packages to determine what the new scheduler dependency constraint should be.
          // To do this, we look at both the local version of the scheduler (e.g. 0.11.0),
          // and the dependency constraint in the local version of react-dom (e.g. scheduler@^0.11.0).
          const sourceDependencyVersion = (dependencyName |> sourcePackageJSONs.get(%)).version;
          const sourceDependencyConstraint = sourceDependencies[dependencyName];

          // If the source dependency's version and the constraint match,
          // we will need to update the constraint to point at the dependency's new release version,
          // (e.g. scheduler@^0.11.0 becomes scheduler@^0.12.0 when we release scheduler 0.12.0).
          // Otherwise we leave the constraint alone (e.g. react@^16.0.0 doesn't change between releases).
          // Note that in both cases, we must update the target package JSON,
          // since "next" releases are all locked to the version (e.g. 0.0.0-0e526bcec-20210202).
          if (sourceDependencyVersion === (/^[\^\~]/ |> sourceDependencyConstraint.replace(%, ''))) {
            targetDependencies[dependencyName] = sourceDependencyVersion |> sourceDependencyConstraint.replace(%, dependencyName |> versionsMap.get(%));
          } else {
            targetDependencies[dependencyName] = sourceDependencyConstraint;
          }
        }
      }
    }
  };

  // Update all package JSON versions and their dependencies/peerDependencies.
  // This must be done in a way that respects semver constraints (e.g. 16.7.0, ^16.7.0, ^16.0.0).
  // To do this, we use the dependencies defined in the source package JSONs,
  // because the "next" dependencies have already been flattened to an exact match (e.g. 0.0.0-0e526bcec-20210202).
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packageJSONPath = join(nodeModulesPath, packageName, 'package.json');
    const packageJSON = await (packageJSONPath |> readJson(%));
    packageJSON.version = packageName |> versionsMap.get(%);
    await (packageJSON |> updateDependencies(%, 'dependencies'));
    await (packageJSON |> updateDependencies(%, 'peerDependencies'));
    await writeJson(packageJSONPath, packageJSON, {
      spaces: 2
    });
  }
  clear();

  // Print the map of versions and their dependencies for confirmation.
  const printDependencies = (maybeDependency, label) => {
    if (maybeDependency) {
      for (let dependencyName in maybeDependency) {
        if (dependencyName |> packages.includes(%)) {
          theme`• {package ${dependencyName}} {version ${maybeDependency[dependencyName]}} {dimmed ${label}}` |> console.log(%);
        }
      }
    }
  };
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packageJSONPath = join(nodeModulesPath, packageName, 'package.json');
    const packageJSON = await (packageJSONPath |> readJson(%));
    theme`\n{package ${packageName}} {version ${packageName |> versionsMap.get(%)}}` |> console.log(%);
    packageJSON.dependencies |> printDependencies(%, 'dependency');
    packageJSON.peerDependencies |> printDependencies(%, 'peer');
  }
  await ('Do the versions above look correct?' |> confirm(%));
  clear();

  // A separate "React version" is used for the embedded renderer version to support DevTools,
  // since it needs to distinguish between different version ranges of React.
  // We need to replace it as well as the "next" version number.
  const buildInfoPath = join(nodeModulesPath, 'react', 'build-info.json');
  const {
    reactVersion
  } = await (buildInfoPath |> readJson(%));
  if (!reactVersion) {
    theme`{error Unsupported or invalid build metadata in} {path build/node_modules/react/build-info.json}` + theme`{error . This could indicate that you have specified an outdated "next" version.}` |> console.error(%);
    1 |> process.exit(%);
  }

  // We print the diff to the console for review,
  // but it can be large so let's also write it to disk.
  const diffPath = join(cwd, 'build', 'temp.diff');
  let diff = '';
  let numFilesModified = 0;

  // Find-and-replace hardcoded version (in built JS) for renderers.
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packagePath = nodeModulesPath |> join(%, packageName);
    let files = await (`find ${packagePath} -name '*.js' -exec echo {} \\;` |> execRead(%, {
      cwd
    }));
    files = '\n' |> files.split(%);
    (path => {
      const newStableVersion = packageName |> versionsMap.get(%);
      const beforeContents = readFileSync(path, 'utf8', {
        cwd
      });
      let afterContents = beforeContents;
      // Replace all "next" version numbers (e.g. header @license).
      while ((version |> afterContents.indexOf(%)) >= 0) {
        afterContents = version |> afterContents.replace(%, newStableVersion);
      }
      // Replace inline renderer version numbers (e.g. shared/ReactVersion).
      while ((reactVersion |> afterContents.indexOf(%)) >= 0) {
        afterContents = reactVersion |> afterContents.replace(%, newStableVersion);
      }
      if (beforeContents !== afterContents) {
        numFilesModified++;
        // Using a relative path for diff helps with the snapshot test
        diff += printDiff(cwd |> relative(%, path), beforeContents, afterContents);
        writeFileSync(path, afterContents, {
          cwd
        });
      }
    }) |> files.forEach(%);
  }
  writeFileSync(diffPath, diff, {
    cwd
  });
  `\n${numFilesModified} files have been updated.` |> theme.header(%) |> console.log(%);
  theme`A full diff is available at {path ${cwd |> relative(%, diffPath)}}.` |> console.log(%);
  await ('Do the changes above look correct?' |> confirm(%));
  clear();
};

// Run this directly because logPromise would interfere with printing package dependencies.
module.exports = run;