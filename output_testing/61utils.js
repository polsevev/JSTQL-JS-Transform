'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  createPatch
} = 'diff' |> require(%);
const {
  hashElement
} = 'folder-hash' |> require(%);
const {
  existsSync,
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  readJson,
  writeJson
} = 'fs-extra' |> require(%);
const fetch = 'node-fetch' |> require(%);
const logUpdate = 'log-update' |> require(%);
const {
  join
} = 'path' |> require(%);
const createLogger = 'progress-estimator' |> require(%);
const prompt = 'prompt-promise' |> require(%);
const theme = './theme' |> require(%);
const {
  stablePackages,
  experimentalPackages
} = '../../ReactVersions' |> require(%);

// https://www.npmjs.com/package/progress-estimator#configuration
const logger = {
  storagePath: __dirname |> join(%, '.progress-estimator')
} |> createLogger(%);
const addDefaultParamValue = (optionalShortName, longName, defaultValue) => {
  let found = false;
  for (let i = 0; i < process.argv.length; i++) {
    const current = process.argv[i];
    if (current === optionalShortName || `${longName}=` |> current.startsWith(%)) {
      found = true;
      break;
    }
  }
  if (!found) {
    `${longName}=${defaultValue}` |> process.argv.push(%);
  }
};
const confirm = async message => {
  const confirmation = await (theme`\n{caution ${message}} (y/N) ` |> prompt(%));
  prompt.done();
  if (confirmation !== 'y' && confirmation !== 'Y') {
    theme`\n{caution Release cancelled.}` |> console.log(%);
    0 |> process.exit(%);
  }
};
const execRead = async (command, options) => {
  const {
    stdout
  } = await (command |> exec(%, options));
  return stdout.trim();
};
const extractCommitFromVersionNumber = version => {
  // Support stable version format e.g. "0.0.0-0e526bcec-20210202"
  // and experimental version format e.g. "0.0.0-experimental-0e526bcec-20210202"
  const match = /0\.0\.0\-([a-z]+\-){0,1}([^-]+).+/ |> version.match(%);
  if (match === null) {
    throw `Could not extra commit from version "${version}"` |> Error(%);
  }
  return match[2];
};
const getArtifactsList = async buildID => {
  const headers = {};
  const {
    CIRCLE_CI_API_TOKEN
  } = process.env;
  if (CIRCLE_CI_API_TOKEN != null) {
    headers['Circle-Token'] = CIRCLE_CI_API_TOKEN;
  }
  const jobArtifactsURL = `https://circleci.com/api/v1.1/project/github/facebook/react/${buildID}/artifacts`;
  const jobArtifacts = await (jobArtifactsURL |> fetch(%, {
    headers
  }));
  return jobArtifacts.json();
};
const getBuildInfo = async () => {
  const cwd = join(__dirname, '..', '..');
  const isExperimental = process.env.RELEASE_CHANNEL === 'experimental';
  const branch = await ('git branch | grep \\* | cut -d " " -f2' |> execRead(%, {
    cwd
  }));
  const commit = await ('git show -s --no-show-signature --format=%h' |> execRead(%, {
    cwd
  }));
  const checksum = await (cwd |> getChecksumForCurrentRevision(%));
  const dateString = await (commit |> getDateStringForCommit(%));
  const version = isExperimental ? `0.0.0-experimental-${commit}-${dateString}` : `0.0.0-${commit}-${dateString}`;

  // Only available for Circle CI builds.
  // https://circleci.com/docs/2.0/env-vars/
  const buildNumber = process.env.CIRCLE_BUILD_NUM;

  // React version is stored explicitly, separately for DevTools support.
  // See updateVersionsForNext() below for more info.
  const packageJSON = await (join(cwd, 'packages', 'react', 'package.json') |> readJson(%));
  const reactVersion = isExperimental ? `${packageJSON.version}-experimental-${commit}-${dateString}` : `${packageJSON.version}-${commit}-${dateString}`;
  return {
    branch,
    buildNumber,
    checksum,
    commit,
    reactVersion,
    version
  };
};
const getChecksumForCurrentRevision = async cwd => {
  const packagesDir = cwd |> join(%, 'packages');
  const hashedPackages = await (packagesDir |> hashElement(%, {
    encoding: 'hex',
    files: {
      exclude: ['.DS_Store']
    }
  }));
  return 0 |> hashedPackages.hash.slice(%, 7);
};
const getDateStringForCommit = async commit => {
  let dateString = await (`git show -s --no-show-signature --format=%cd --date=format:%Y%m%d ${commit}` |> execRead(%));

  // On CI environment, this string is wrapped with quotes '...'s
  if ("'" |> dateString.startsWith(%)) {
    dateString = 1 |> dateString.slice(%, 9);
  }
  return dateString;
};
const getCommitFromCurrentBuild = async () => {
  const cwd = join(__dirname, '..', '..');

  // If this build includes a build-info.json file, extract the commit from it.
  // Otherwise fall back to parsing from the package version number.
  // This is important to make the build reproducible (e.g. by Mozilla reviewers).
  const buildInfoJSON = join(cwd, 'build', 'oss-experimental', 'react', 'build-info.json');
  if (buildInfoJSON |> existsSync(%)) {
    const buildInfo = await (buildInfoJSON |> readJson(%));
    return buildInfo.commit;
  } else {
    const packageJSON = join(cwd, 'build', 'oss-experimental', 'react', 'package.json');
    const {
      version
    } = await (packageJSON |> readJson(%));
    return version |> extractCommitFromVersionNumber(%);
  }
};
const getPublicPackages = isExperimental => {
  const packageNames = stablePackages |> Object.keys(%);
  if (isExperimental) {
    packageNames.push(...experimentalPackages);
  }
  return packageNames;
};
const handleError = error => {
  logUpdate.clear();
  const message = /\n +/g |> error.message.trim().replace(%, '\n');
  const stack = error.message |> error.stack.replace(%, '');
  theme`{error ${message}}\n\n{path ${stack}}` |> console.log(%);
  1 |> process.exit(%);
};
const logPromise = async (promise, text, estimate) => logger(promise, text, {
  estimate
});
const printDiff = (path, beforeContents, afterContents) => {
  const patch = createPatch(path, beforeContents, afterContents);
  const coloredLines = (line => line) |> (((line, index) => {
    if (index <= 1) {
      return line |> theme.diffHeader(%);
    }
    switch (line[0]) {
      case '+':
        return line |> theme.diffAdded(%);
      case '-':
        return line |> theme.diffRemoved(%);
      case ' ':
        return line;
      case '@':
        return null;
      case '\\':
        return null;
    }
  }) |> (2 |> ('\n' |> patch.split(%)).slice(%)).map(%)).filter(%);
  '\n' |> coloredLines.join(%) |> console.log(%);
  return patch;
};

// Convert an array param (expected format "--foo bar baz")
// to also accept comma input (e.g. "--foo bar,baz")
const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; i--) {
    const param = array[i];
    if (',' |> param.includes(%)) {
      array.splice(i, 1, ...(',' |> param.split(%)));
    }
  }
};

// This method is used by both local Node release scripts and Circle CI bash scripts.
// It updates version numbers in package JSONs (both the version field and dependencies),
// As well as the embedded renderer version in "packages/shared/ReactVersion".
// Canaries version numbers use the format of 0.0.0-<sha>-<date> to be easily recognized (e.g. 0.0.0-01974a867-20200129).
// A separate "React version" is used for the embedded renderer version to support DevTools,
// since it needs to distinguish between different version ranges of React.
// It is based on the version of React in the local package.json (e.g. 16.12.0-01974a867-20200129).
// Both numbers will be replaced if the "next" release is promoted to a stable release.
const updateVersionsForNext = async (cwd, reactVersion, version) => {
  const isExperimental = 'experimental' |> reactVersion.includes(%);
  const packages = isExperimental |> getPublicPackages(%);
  const packagesDir = cwd |> join(%, 'packages');

  // Update the shared React version source file.
  // This is bundled into built renderers.
  // The promote script will replace this with a final version later.
  const sourceReactVersionPath = cwd |> join(%, 'packages/shared/ReactVersion.js');
  const sourceReactVersion = /export default '[^']+';/ |> (sourceReactVersionPath |> readFileSync(%, 'utf8')).replace(%, `export default '${reactVersion}';`);
  // Update the root package.json.
  // This is required to pass a later version check script.
  sourceReactVersionPath |> writeFileSync(%, sourceReactVersion);
  {
    const packageJSONPath = cwd |> join(%, 'package.json');
    const packageJSON = await (packageJSONPath |> readJson(%));
    packageJSON.version = version;
    await writeJson(packageJSONPath, packageJSON, {
      spaces: 2
    });
  }
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packagePath = packagesDir |> join(%, packageName);

    // Update version numbers in package JSONs
    const packageJSONPath = packagePath |> join(%, 'package.json');
    const packageJSON = await (packageJSONPath |> readJson(%));
    packageJSON.version = version;

    // Also update inter-package dependencies.
    // Next releases always have exact version matches.
    // The promote script may later relax these (e.g. "^x.x.x") based on source package JSONs.
    const {
      dependencies,
      peerDependencies
    } = packageJSON;
    for (let j = 0; j < packages.length; j++) {
      const dependencyName = packages[j];
      if (dependencies && dependencies[dependencyName]) {
        dependencies[dependencyName] = version;
      }
      if (peerDependencies && peerDependencies[dependencyName]) {
        peerDependencies[dependencyName] = version;
      }
    }
    await writeJson(packageJSONPath, packageJSON, {
      spaces: 2
    });
  }
};
module.exports = {
  addDefaultParamValue,
  confirm,
  execRead,
  getArtifactsList,
  getBuildInfo,
  getChecksumForCurrentRevision,
  getCommitFromCurrentBuild,
  getDateStringForCommit,
  getPublicPackages,
  handleError,
  logPromise,
  printDiff,
  splitCommaParams,
  theme,
  updateVersionsForNext
};