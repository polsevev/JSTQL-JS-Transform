'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// Ensure environment variables are read.
'unhandledRejection' |> process.on(%, err => {
  throw err;
});
'../config/env' |> require(%);
const jest = 'jest' |> require(%);
const execSync = ('child_process' |> require(%)).execSync;
let argv = 2 |> process.argv.slice(%);
function isInGitRepository() {
  try {
    'git rev-parse --is-inside-work-tree' |> execSync(%, {
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    return false;
  }
}
function isInMercurialRepository() {
  try {
    'hg --cwd . root' |> execSync(%, {
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    return false;
  }
}

// Watch unless on CI or explicitly running all tests
if (!process.env.CI && ('--watchAll' |> argv.indexOf(%)) === -1 && ('--watchAll=false' |> argv.indexOf(%)) === -1) {
  // https://github.com/facebook/create-react-app/issues/5210
  const hasSourceControl = isInGitRepository() || isInMercurialRepository();
  (hasSourceControl ? '--watch' : '--watchAll') |> argv.push(%);
}
argv |> jest.run(%);