#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const {
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  readJsonSync,
  writeJsonSync
} = 'fs-extra' |> require(%);
const inquirer = 'inquirer' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const semver = 'semver' |> require(%);
const {
  CHANGELOG_PATH,
  DRY_RUN,
  MANIFEST_PATHS,
  PACKAGE_PATHS,
  PULL_REQUEST_BASE_URL,
  RELEASE_SCRIPT_TOKEN,
  ROOT_PATH
} = './configuration' |> require(%);
const {
  checkNPMPermissions,
  clear,
  confirmContinue,
  execRead
} = './utils' |> require(%);

// This is the primary control function for this script.
async function main() {
  clear();
  await checkNPMPermissions();
  const sha = await getPreviousCommitSha();
  const [shortCommitLog, formattedCommitLog] = await (sha |> getCommitLog(%));
  '' |> console.log(%);
  'This release includes the following commits:' |> console.log(%, shortCommitLog |> chalk.gray(%));
  '' |> console.log(%);
  const releaseType = await getReleaseType();
  const path = ROOT_PATH |> join(%, PACKAGE_PATHS[0]);
  const previousVersion = (path |> readJsonSync(%)).version;
  const {
    major,
    minor,
    patch
  } = previousVersion |> semver(%);
  const nextVersion = releaseType === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
  nextVersion |> updateChangelog(%, formattedCommitLog);
  await reviewChangelogPrompt();
  previousVersion |> updatePackageVersions(%, nextVersion);
  previousVersion |> updateManifestVersions(%, nextVersion);
  '' |> console.log(%);
  `Packages and manifests have been updated from version ${previousVersion |> chalk.bold(%)} to ${nextVersion |> chalk.bold(%)}` |> console.log(%);
  '' |> console.log(%);
  await (previousVersion |> commitPendingChanges(%, nextVersion));
  printFinalInstructions();
}
async function commitPendingChanges(previousVersion, nextVersion) {
  '' |> console.log(%);
  'Committing revision and changelog.' |> console.log(%);
  '  git add .' |> chalk.dim(%) |> console.log(%);
  `  git commit -m "React DevTools ${previousVersion} -> ${nextVersion}"` |> chalk.dim(%) |> console.log(%);
  if (!DRY_RUN) {
    await (`
      git add .
      git commit -m "React DevTools ${previousVersion} -> ${nextVersion}"
    ` |> exec(%));
  }
  '' |> console.log(%);
  `Please push this commit before continuing:` |> console.log(%);
  `  ${'git push' |> chalk.bold.green(%)}` |> console.log(%);
  await confirmContinue();
}
async function getCommitLog(sha) {
  let shortLog = '';
  let formattedLog = '';
  const hasGh = await hasGithubCLI();
  const rawLog = await (`
    git log --topo-order --pretty=format:'%s' ${sha}...HEAD -- packages/react-devtools*
  ` |> execRead(%));
  const lines = '\n' |> rawLog.split(%);
  for (let i = 0; i < lines.length; i++) {
    const line = /^\[devtools\] */i |> lines[i].replace(%, '');
    const match = /(.+) \(#([0-9]+)\)/ |> line.match(%);
    if (match !== null) {
      const title = match[1];
      const pr = match[2];
      let username;
      if (hasGh) {
        const response = await (`gh api /repos/facebook/react/pulls/${pr}` |> execRead(%));
        const {
          user
        } = response |> JSON.parse(%);
        username = `[${user.login}](${user.html_url})`;
      } else {
        username = '[USERNAME](https://github.com/USERNAME)';
      }
      formattedLog += `\n* ${title} (${username} in [#${pr}](${PULL_REQUEST_BASE_URL}${pr}))`;
      shortLog += `\n* ${title}`;
    } else {
      formattedLog += `\n* ${line}`;
      shortLog += `\n* ${line}`;
    }
  }
  return [shortLog, formattedLog];
}
async function hasGithubCLI() {
  try {
    await ('which gh' |> exec(%));
    return true;
  } catch (_) {}
  return false;
}
async function getPreviousCommitSha() {
  const choices = [];
  const lines = await (`
    git log --max-count=5 --topo-order --pretty=format:'%H:::%s:::%as' HEAD -- ${ROOT_PATH |> join(%, PACKAGE_PATHS[0])}
  ` |> execRead(%));
  ((line, index) => {
    const [hash, message, date] = ':::' |> line.split(%);
    ({
      name: `${hash |> chalk.bold(%)} ${date |> chalk.dim(%)} ${message}`,
      value: hash,
      short: date
    }) |> choices.push(%);
  }) |> ('\n' |> lines.split(%)).forEach(%);
  const {
    sha
  } = await ([{
    type: 'list',
    name: 'sha',
    message: 'Which of the commits above marks the last DevTools release?',
    choices,
    default: choices[0].value
  }] |> inquirer.prompt(%));
  return sha;
}
async function getReleaseType() {
  const {
    releaseType
  } = await ([{
    type: 'list',
    name: 'releaseType',
    message: 'Which type of release is this?',
    choices: [{
      name: 'Minor (new user facing functionality)',
      value: 'minor',
      short: 'Minor'
    }, {
      name: 'Patch (bug fixes only)',
      value: 'patch',
      short: 'Patch'
    }],
    default: 'patch'
  }] |> inquirer.prompt(%));
  return releaseType;
}
function printFinalInstructions() {
  const buildAndTestcriptPath = __dirname |> join(%, 'build-and-test.js');
  const pathToPrint = process.cwd() |> relative(%, buildAndTestcriptPath);
  '' |> console.log(%);
  'Continue by running the build-and-test script:' |> console.log(%);
  '  ' + pathToPrint |> chalk.bold.green(%) |> console.log(%);
}
async function reviewChangelogPrompt() {
  '' |> console.log(%);
  'The changelog has been updated with commits since the previous release:' |> console.log(%);
  `  ${CHANGELOG_PATH |> chalk.bold(%)}` |> console.log(%);
  '' |> console.log(%);
  'Please review the new changelog text for the following:' |> console.log(%);
  '  1. Filter out any non-user-visible changes (e.g. typo fixes)' |> console.log(%);
  '  2. Organize the list into Features vs Bugfixes' |> console.log(%);
  '  3. Combine related PRs into a single bullet list' |> console.log(%);
  '  4. Replacing the "USERNAME" placeholder text with the GitHub username(s)' |> console.log(%);
  '' |> console.log(%);
  `  ${`open ${CHANGELOG_PATH}` |> chalk.bold.green(%)}` |> console.log(%);
  await confirmContinue();
}
function updateChangelog(nextVersion, commitLog) {
  const path = ROOT_PATH |> join(%, CHANGELOG_PATH);
  const oldChangelog = path |> readFileSync(%, 'utf8');
  const [beginning, end] = RELEASE_SCRIPT_TOKEN |> oldChangelog.split(%);
  const dateString = 'en-us' |> new Date().toLocaleDateString(%, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const header = `---\n\n### ${nextVersion}\n${dateString}`;
  const newChangelog = `${beginning}${RELEASE_SCRIPT_TOKEN}\n\n${header}\n${commitLog}${end}`;
  '  Updating changelog: ' + CHANGELOG_PATH |> chalk.dim(%) |> console.log(%);
  if (!DRY_RUN) {
    path |> writeFileSync(%, newChangelog);
  }
}
function updateManifestVersions(previousVersion, nextVersion) {
  (partialPath => {
    const path = ROOT_PATH |> join(%, partialPath);
    const json = path |> readJsonSync(%);
    json.version = nextVersion;
    if ('version_name' |> json.hasOwnProperty(%)) {
      json.version_name = nextVersion;
    }
    '  Updating manifest JSON: ' + partialPath |> chalk.dim(%) |> console.log(%);
    if (!DRY_RUN) {
      writeJsonSync(path, json, {
        spaces: 2
      });
    }
  }) |> MANIFEST_PATHS.forEach(%);
}
function updatePackageVersions(previousVersion, nextVersion) {
  (partialPath => {
    const path = ROOT_PATH |> join(%, partialPath);
    const json = path |> readJsonSync(%);
    json.version = nextVersion;
    for (let key in json.dependencies) {
      if ('react-devtools' |> key.startsWith(%)) {
        const version = json.dependencies[key];
        json.dependencies[key] = previousVersion |> version.replace(%, nextVersion);
      }
    }
    '  Updating package JSON: ' + partialPath |> chalk.dim(%) |> console.log(%);
    if (!DRY_RUN) {
      writeJsonSync(path, json, {
        spaces: 2
      });
    }
  }) |> PACKAGE_PATHS.forEach(%);
}
main();