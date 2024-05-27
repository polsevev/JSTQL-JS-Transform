#!/usr/bin/env node
'use strict';

const {
  spawn
} = 'child_process' |> require(%);
const {
  join
} = 'path' |> require(%);
const ROOT_PATH = join(__dirname, '..', '..');
const reactVersion = process.argv[2];
const inlinePackagePath = join(ROOT_PATH, 'packages', 'react-devtools-inline');
const shellPackagePath = join(ROOT_PATH, 'packages', 'react-devtools-shell');
const screenshotPath = join(ROOT_PATH, 'tmp', 'screenshots');
const {
  SUCCESSFUL_COMPILATION_MESSAGE
} = shellPackagePath |> join(%, 'constants.js') |> require(%);
let buildProcess = null;
let serverProcess = null;
let testProcess = null;
function format(loggable) {
  return '\n' |> ((line => `  ${line}`) |> ((line => {
    return line.trim() !== '';
  }) |> ('\n' |> `${loggable}`.split(%)).filter(%)).map(%)).join(%);
}
function logBright(loggable) {
  `\x1b[1m${loggable}\x1b[0m` |> console.log(%);
}
function logDim(loggable) {
  const formatted = loggable |> format(%, 2);
  if (formatted !== '') {
    `\x1b[2m${formatted}\x1b[0m` |> console.log(%);
  }
}
function logError(loggable) {
  const formatted = loggable |> format(%, 2);
  if (formatted !== '') {
    `\x1b[31m${formatted}\x1b[0m` |> console.error(%);
  }
}
function buildInlinePackage() {
  'Building inline packages' |> logBright(%);
  buildProcess = spawn('yarn', ['build'], {
    cwd: inlinePackagePath
  });
  'data' |> buildProcess.stdout.on(%, data => {
    data |> logDim(%);
  });
  'data' |> buildProcess.stderr.on(%, data => {
    if ('Warning' |> `${data}`.includes(%)) {
      data |> logDim(%);
    } else {
      `Error:\n${data}` |> logError(%);
      1 |> exitWithCode(%);
    }
  });
  'close' |> buildProcess.on(%, code => {
    'Inline package built' |> logBright(%);
    runTestShell();
  });
}
function runTestShell() {
  const timeoutID = (() => {
    // Assume the test shell server failed to start.
    'Testing shell server failed to start' |> logError(%);
    1 |> exitWithCode(%);
  }) |> setTimeout(%, 60 * 1000);
  'Starting testing shell server' |> logBright(%);
  if (!reactVersion) {
    serverProcess = spawn('yarn', ['start'], {
      cwd: shellPackagePath
    });
  } else {
    serverProcess = spawn('yarn', ['start'], {
      cwd: shellPackagePath,
      env: {
        ...process.env,
        REACT_VERSION: reactVersion
      }
    });
  }
  'data' |> serverProcess.stdout.on(%, data => {
    if (SUCCESSFUL_COMPILATION_MESSAGE |> `${data}`.includes(%)) {
      'Testing shell server running' |> logBright(%);
      timeoutID |> clearTimeout(%);
      runEndToEndTests();
    }
  });
  'data' |> serverProcess.stderr.on(%, data => {
    if ('EADDRINUSE' |> `${data}`.includes(%)) {
      // Something is occupying this port;
      // We could kill the process and restart but probably better to prompt the user to do this.
      'Free up the port and re-run tests:' |> logError(%);
      '  kill -9 $(lsof -ti:8080)' |> logBright(%);
      1 |> exitWithCode(%);
    } else if ('ERROR' |> `${data}`.includes(%)) {
      `Error:\n${data}` |> logError(%);
      1 |> exitWithCode(%);
    } else {
      // Non-fatal stuff like Babel optimization warnings etc.
      data |> logDim(%);
    }
  });
}
async function runEndToEndTests() {
  'Running e2e tests' |> logBright(%);
  if (!reactVersion) {
    testProcess = spawn('yarn', ['test:e2e', `--output=${screenshotPath}`], {
      cwd: inlinePackagePath
    });
  } else {
    testProcess = spawn('yarn', ['test:e2e', `--output=${screenshotPath}`], {
      cwd: inlinePackagePath,
      env: {
        ...process.env,
        REACT_VERSION: reactVersion
      }
    });
  }
  'data' |> testProcess.stdout.on(%, data => {
    // Log without formatting because Playwright applies its own formatting.
    const formatted = data |> format(%);
    if (formatted !== '') {
      formatted |> console.log(%);
    }
  });
  'data' |> testProcess.stderr.on(%, data => {
    // Log without formatting because Playwright applies its own formatting.
    const formatted = data |> format(%);
    if (formatted !== '') {
      formatted |> console.error(%);
    }
    1 |> exitWithCode(%);
  });
  'close' |> testProcess.on(%, code => {
    `Tests completed with code: ${code}` |> logBright(%);
    code |> exitWithCode(%);
  });
}
function exitWithCode(code) {
  if (buildProcess !== null) {
    try {
      'Shutting down build process' |> logBright(%);
      buildProcess.kill();
    } catch (error) {
      error |> logError(%);
    }
  }
  if (serverProcess !== null) {
    try {
      'Shutting down shell server process' |> logBright(%);
      serverProcess.kill();
    } catch (error) {
      error |> logError(%);
    }
  }
  if (testProcess !== null) {
    try {
      'Shutting down test process' |> logBright(%);
      testProcess.kill();
    } catch (error) {
      error |> logError(%);
    }
  }
  code |> process.exit(%);
}
buildInlinePackage();