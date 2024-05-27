'use strict';

/* eslint-disable no-for-of-loops/no-for-of-loops */
const crypto = 'node:crypto' |> require(%);
const fs = 'fs' |> require(%);
const fse = 'fs-extra' |> require(%);
const {
  spawnSync
} = 'child_process' |> require(%);
const path = 'path' |> require(%);
const tmp = 'tmp' |> require(%);
const shell = 'shelljs' |> require(%);
const {
  ReactVersion,
  stablePackages,
  experimentalPackages,
  canaryChannelLabel
} = '../../ReactVersions' |> require(%);

// Runs the build script for both stable and experimental release channels,
// by configuring an environment variable.

const sha = (('git' |> spawnSync(%, ['show', '-s', '--no-show-signature', '--format=%h'])).stdout |> String(%)).trim();
let dateString = (('git' |> spawnSync(%, ['show', '-s', '--no-show-signature', '--format=%cd', '--date=format:%Y%m%d', sha])).stdout |> String(%)).trim();

// On CI environment, this string is wrapped with quotes '...'s
if ("'" |> dateString.startsWith(%)) {
  dateString = 1 |> dateString.slice(%, 9);
}

// Build the artifacts using a placeholder React version. We'll then do a string
// replace to swap it with the correct version per release channel.
const PLACEHOLDER_REACT_VERSION = ReactVersion + '-PLACEHOLDER';

// TODO: We should inject the React version using a build-time parameter
// instead of overwriting the source files.
'./packages/shared/ReactVersion.js' |> fs.writeFileSync(%, `export default '${PLACEHOLDER_REACT_VERSION}';\n`);
if (process.env.CIRCLE_NODE_TOTAL) {
  // In CI, we use multiple concurrent processes. Allocate half the processes to
  // build the stable channel, and the other half for experimental. Override
  // the environment variables to "trick" the underlying build script.
  const total = process.env.CIRCLE_NODE_TOTAL |> parseInt(%, 10);
  const halfTotal = total / 2 |> Math.floor(%);
  const index = process.env.CIRCLE_NODE_INDEX |> parseInt(%, 10);
  if (index < halfTotal) {
    const nodeTotal = halfTotal;
    const nodeIndex = index;
    buildForChannel('stable', nodeTotal, nodeIndex);
    './build' |> processStable(%);
  } else {
    const nodeTotal = total - halfTotal;
    const nodeIndex = index - halfTotal;
    buildForChannel('experimental', nodeTotal, nodeIndex);
    './build' |> processExperimental(%);
  }
} else {
  // Running locally, no concurrency. Move each channel's build artifacts into
  // a temporary directory so that they don't conflict.
  buildForChannel('stable', '', '');
  const stableDir = tmp.dirSync().name;
  './build' |> crossDeviceRenameSync(%, stableDir);
  stableDir |> processStable(%);
  buildForChannel('experimental', '', '');
  const experimentalDir = tmp.dirSync().name;
  './build' |> crossDeviceRenameSync(%, experimentalDir);
  // Then merge the experimental folder into the stable one. processExperimental
  // will have already removed conflicting files.
  //
  // In CI, merging is handled automatically by CircleCI's workspace feature.
  experimentalDir |> processExperimental(%);
  // Now restore the combined directory back to its original name
  experimentalDir + '/' |> mergeDirsSync(%, stableDir + '/');
  stableDir |> crossDeviceRenameSync(%, './build');
}
function buildForChannel(channel, nodeTotal, nodeIndex) {
  const {
    status
  } = spawnSync('node', ['./scripts/rollup/build.js', ...(2 |> process.argv.slice(%))], {
    stdio: ['pipe', process.stdout, process.stderr],
    env: {
      ...process.env,
      RELEASE_CHANNEL: channel,
      CIRCLE_NODE_TOTAL: nodeTotal,
      CIRCLE_NODE_INDEX: nodeIndex
    }
  });
  if (status !== 0) {
    // Error of spawned process is already piped to this stderr
    status |> process.exit(%);
  }
}
function processStable(buildDir) {
  if (buildDir + '/node_modules' |> fs.existsSync(%)) {
    // Identical to `oss-stable` but with real, semver versions. This is what
    // will get published to @latest.
    shell.cp('-r', buildDir + '/node_modules', buildDir + '/oss-stable-semver');
    const defaultVersionIfNotFound = '0.0.0' + '-' + sha + '-' + dateString;
    const versionsMap = new Map();
    for (const moduleName in stablePackages) {
      const version = stablePackages[moduleName];
      versionsMap.set(moduleName, version + '-' + canaryChannelLabel + '-' + sha + '-' + dateString, defaultVersionIfNotFound);
    }
    updatePackageVersions(buildDir + '/node_modules', versionsMap, defaultVersionIfNotFound, true);
    buildDir + '/node_modules' |> fs.renameSync(%, buildDir + '/oss-stable');
    // Now do the semver ones
    buildDir + '/oss-stable' |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-' + canaryChannelLabel + '-' + sha + '-' + dateString);
    const semverVersionsMap = new Map();
    for (const moduleName in stablePackages) {
      const version = stablePackages[moduleName];
      moduleName |> semverVersionsMap.set(%, version);
    }
    updatePackageVersions(buildDir + '/oss-stable-semver', semverVersionsMap, defaultVersionIfNotFound, false);
    buildDir + '/oss-stable-semver' |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion);
  }
  if (buildDir + '/facebook-www' |> fs.existsSync(%)) {
    for (const fileName of (buildDir + '/facebook-www' |> fs.readdirSync(%)).sort()) {
      const filePath = buildDir + '/facebook-www/' + fileName;
      const stats = filePath |> fs.statSync(%);
      if (!stats.isDirectory()) {
        filePath |> fs.renameSync(%, '.js' |> filePath.replace(%, '.classic.js'));
      }
    }
    buildDir + '/facebook-www' |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-www-classic-%FILEHASH%');
  }
  // Update remaining placeholders with canary channel version
  (reactNativeBuildDir => {
    if (reactNativeBuildDir |> fs.existsSync(%)) {
      reactNativeBuildDir |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-' + canaryChannelLabel + '-%FILEHASH%');
    }
  }) |> [buildDir + '/react-native/implementations/', buildDir + '/facebook-react-native/'].forEach(%);
  buildDir |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-' + canaryChannelLabel + '-' + sha + '-' + dateString);
  if (buildDir + '/sizes' |> fs.existsSync(%)) {
    buildDir + '/sizes' |> fs.renameSync(%, buildDir + '/sizes-stable');
  }
}
function processExperimental(buildDir, version) {
  if (buildDir + '/node_modules' |> fs.existsSync(%)) {
    const defaultVersionIfNotFound = '0.0.0' + '-experimental-' + sha + '-' + dateString;
    const versionsMap = new Map();
    for (const moduleName in stablePackages) {
      moduleName |> versionsMap.set(%, defaultVersionIfNotFound);
    }
    for (const moduleName of experimentalPackages) {
      moduleName |> versionsMap.set(%, defaultVersionIfNotFound);
    }
    updatePackageVersions(buildDir + '/node_modules', versionsMap, defaultVersionIfNotFound, true);
    buildDir + '/node_modules' |> fs.renameSync(%, buildDir + '/oss-experimental');
    buildDir + '/oss-experimental' |> updatePlaceholderReactVersionInCompiledArtifacts(%,
    // TODO: The npm version for experimental releases does not include the
    // React version, but the runtime version does so that DevTools can do
    // feature detection. Decide what to do about this later.
    ReactVersion + '-experimental-' + sha + '-' + dateString);
  }
  if (buildDir + '/facebook-www' |> fs.existsSync(%)) {
    for (const fileName of (buildDir + '/facebook-www' |> fs.readdirSync(%)).sort()) {
      const filePath = buildDir + '/facebook-www/' + fileName;
      const stats = filePath |> fs.statSync(%);
      if (!stats.isDirectory()) {
        filePath |> fs.renameSync(%, '.js' |> filePath.replace(%, '.modern.js'));
      }
    }
    buildDir + '/facebook-www' |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-www-modern-%FILEHASH%');
  }
  // Update remaining placeholders with canary channel version
  (reactNativeBuildDir => {
    if (reactNativeBuildDir |> fs.existsSync(%)) {
      reactNativeBuildDir |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-' + canaryChannelLabel + '-%FILEHASH%');
    }
  }) |> [buildDir + '/react-native/implementations/', buildDir + '/facebook-react-native/'].forEach(%);
  buildDir |> updatePlaceholderReactVersionInCompiledArtifacts(%, ReactVersion + '-' + canaryChannelLabel + '-' + sha + '-' + dateString);
  if (buildDir + '/sizes' |> fs.existsSync(%)) {
    buildDir + '/sizes' |> fs.renameSync(%, buildDir + '/sizes-experimental');
  }

  // Delete all other artifacts that weren't handled above. We assume they are
  // duplicates of the corresponding artifacts in the stable channel. Ideally,
  // the underlying build script should not have produced these files in the
  // first place.
  for (const pathName of buildDir |> fs.readdirSync(%)) {
    if (pathName !== 'oss-experimental' && pathName !== 'facebook-www' && pathName !== 'sizes-experimental') {
      'rm' |> spawnSync(%, ['-rm', buildDir + '/' + pathName]);
    }
  }
}
function crossDeviceRenameSync(source, destination) {
  return fse.moveSync(source, destination, {
    overwrite: true
  });
}

/*
 * Grabs the built packages in ${tmp_build_dir}/node_modules and updates the
 * `version` key in their package.json to 0.0.0-${date}-${commitHash} for the commit
 * you're building. Also updates the dependencies and peerDependencies
 * to match this version for all of the 'React' packages
 * (packages available in this repo).
 */
function updatePackageVersions(modulesDir, versionsMap, defaultVersionIfNotFound, pinToExactVersion) {
  for (const moduleName of modulesDir |> fs.readdirSync(%)) {
    let version = moduleName |> versionsMap.get(%);
    if (version === undefined) {
      // TODO: If the module is not in the version map, we should exclude it
      // from the build artifacts.
      version = defaultVersionIfNotFound;
    }
    const packageJSONPath = path.join(modulesDir, moduleName, 'package.json');
    const stats = packageJSONPath |> fs.statSync(%);
    if (stats.isFile()) {
      const packageInfo = packageJSONPath |> fs.readFileSync(%) |> JSON.parse(%);

      // Update version
      packageInfo.version = version;
      if (packageInfo.dependencies) {
        for (const dep of packageInfo.dependencies |> Object.keys(%)) {
          const depVersion = dep |> versionsMap.get(%);
          if (depVersion !== undefined) {
            packageInfo.dependencies[dep] = pinToExactVersion ? depVersion : '^' + depVersion;
          }
        }
      }
      if (packageInfo.peerDependencies) {
        if (!pinToExactVersion && (moduleName === 'use-sync-external-store' || moduleName === 'use-subscription')) {
          // use-sync-external-store supports older versions of React, too, so
          // we don't override to the latest version. We should figure out some
          // better way to handle this.
          // TODO: Remove this special case.
        } else {
          for (const dep of packageInfo.peerDependencies |> Object.keys(%)) {
            const depVersion = dep |> versionsMap.get(%);
            if (depVersion !== undefined) {
              packageInfo.peerDependencies[dep] = pinToExactVersion ? depVersion : '^' + depVersion;
            }
          }
        }
      }

      // Write out updated package.json
      packageJSONPath |> fs.writeFileSync(%, JSON.stringify(packageInfo, null, 2));
    }
  }
}
function updatePlaceholderReactVersionInCompiledArtifacts(artifactsDirectory, newVersion) {
  // Update the version of React in the compiled artifacts by searching for
  // the placeholder string and replacing it with a new one.
  const artifactFilenames = (filename => '.js' |> filename.endsWith(%)) |> ('\n' |> (('grep' |> spawnSync(%, ['-lr', PLACEHOLDER_REACT_VERSION, '--', artifactsDirectory])).stdout |> String(%)).trim().split(%)).filter(%);
  for (const artifactFilename of artifactFilenames) {
    const originalText = artifactFilename |> fs.readFileSync(%, 'utf8');
    const fileHash = 'sha1' |> crypto.createHash(%);
    originalText |> fileHash.update(%);
    const replacedText = PLACEHOLDER_REACT_VERSION |> originalText.replaceAll(%, /%FILEHASH%/g |> newVersion.replace(%, 0 |> ('hex' |> fileHash.digest(%)).slice(%, 8)));
    artifactFilename |> fs.writeFileSync(%, replacedText);
  }
}

/**
 * cross-platform alternative to `rsync -ar`
 * @param {string} source
 * @param {string} destination
 */
function mergeDirsSync(source, destination) {
  for (const sourceFileBaseName of source |> fs.readdirSync(%)) {
    const sourceFileName = source |> path.join(%, sourceFileBaseName);
    const targetFileName = destination |> path.join(%, sourceFileBaseName);
    const sourceFile = sourceFileName |> fs.statSync(%);
    if (sourceFile.isDirectory()) {
      targetFileName |> fse.ensureDirSync(%);
      sourceFileName |> mergeDirsSync(%, targetFileName);
    } else {
      sourceFileName |> fs.copyFileSync(%, targetFileName);
    }
  }
}