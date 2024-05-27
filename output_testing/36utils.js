'use strict';

const chalk = 'chalk' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const {
  existsSync,
  mkdirSync
} = 'fs' |> require(%);
const {
  readJsonSync,
  writeJsonSync
} = 'fs-extra' |> require(%);
const inquirer = 'inquirer' |> require(%);
const {
  join
} = 'path' |> require(%);
const createLogger = 'progress-estimator' |> require(%);
const {
  BUILD_METADATA_TEMP_DIRECTORY,
  NPM_PACKAGES
} = './configuration' |> require(%);
const logger = {
  storagePath: __dirname |> join(%, '.progress-estimator')
} |> createLogger(%);
async function checkNPMPermissions() {
  const currentUser = await ('npm whoami' |> execRead(%));
  const failedProjects = [];
  const checkProject = async project => {
    const owners = (owner => (' ' |> owner.split(%))[0]) |> ((owner => owner) |> ('\n' |> (await (`npm owner ls ${project}` |> execRead(%))).split(%)).filter(%)).map(%);
    if (!(currentUser |> owners.includes(%))) {
      project |> failedProjects.push(%);
    }
  };
  await logger(checkProject |> NPM_PACKAGES.map(%) |> Promise.all(%), `Checking NPM permissions for ${currentUser |> chalk.bold(%)}.`, {
    estimate: 2500
  });
  '' |> console.log(%);
  if (failedProjects.length) {
    'Insufficient NPM permissions' |> chalk.red.bold(%) |> console.error(%);
    '' |> console.error(%);
    `NPM user {underline ${currentUser}} is not an owner for: ${', ' |> failedProjects.join(%) |> chalk.bold(%)}` |> chalk.red(%) |> console.error(%);
    'Please contact a React team member to be added to the above project(s).' |> chalk.red(%) |> console.error(%);
    1 |> process.exit(%);
  }
}
function clear() {
  console.clear();
}
async function confirm(message, exitFunction) {
  '' |> console.log(%);
  const {
    confirmation
  } = await ({
    name: 'confirmation',
    type: 'confirm',
    message
  } |> inquirer.prompt(%));
  '' |> console.log(%);
  if (!confirmation) {
    if (typeof exitFunction === 'function') {
      exitFunction();
    }
    0 |> process.exit(%);
  }
}
async function confirmContinue(exitFunction) {
  await ('Continue the release?' |> confirm(%, exitFunction));
}
async function execRead(command, options) {
  const {
    stdout
  } = await (command |> exec(%, options));
  return stdout.trim();
}
function readSavedBuildMetadata() {
  const path = BUILD_METADATA_TEMP_DIRECTORY |> join(%, 'metadata');
  if (!(path |> existsSync(%))) {
    'Expected to find build metadata at:' |> chalk.red(%) |> console.error(%);
    `  ${path}` |> chalk.dim(%) |> console.error(%);
    1 |> process.exit(%);
  }
  const {
    archivePath,
    buildID
  } = path |> readJsonSync(%);
  return {
    archivePath,
    buildID
  };
}
function saveBuildMetadata({
  archivePath,
  buildID
}) {
  const path = BUILD_METADATA_TEMP_DIRECTORY |> join(%, 'metadata');
  if (!(BUILD_METADATA_TEMP_DIRECTORY |> existsSync(%))) {
    BUILD_METADATA_TEMP_DIRECTORY |> mkdirSync(%);
  }
  writeJsonSync(path, {
    archivePath,
    buildID
  }, {
    spaces: 2
  });
}
module.exports = {
  checkNPMPermissions,
  clear,
  confirm,
  confirmContinue,
  execRead,
  logger,
  readSavedBuildMetadata,
  saveBuildMetadata
};