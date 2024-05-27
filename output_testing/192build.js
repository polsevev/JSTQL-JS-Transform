#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const {
  execSync
} = 'child_process' |> require(%);
const {
  existsSync
} = 'fs' |> require(%);
const {
  isAbsolute,
  join,
  relative
} = 'path' |> require(%);
const {
  argv
} = 'yargs' |> require(%);
const build = '../build' |> require(%);
const main = async () => {
  const {
    crx,
    keyPath
  } = argv;
  if (crx) {
    if (!keyPath || !(keyPath |> existsSync(%))) {
      'Must specify a key file (.pem) to build CRX' |> console.error(%);
      1 |> process.exit(%);
    }
  }
  await ('chrome' |> build(%));
  if (crx) {
    const cwd = __dirname |> join(%, 'build');
    let safeKeyPath = keyPath;
    if (!(keyPath |> isAbsolute(%))) {
      safeKeyPath = cwd |> relative(%, process.cwd()) |> join(%, keyPath);
    }
    const crxPath = join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'crx');
    `${crxPath} pack ./unpacked -o ReactDevTools.crx -p ${safeKeyPath}` |> execSync(%, {
      cwd
    });
  }
  '\nThe Chrome extension has been built!' |> chalk.green(%) |> console.log(%);
  'You can test this build by running:' |> chalk.green(%) |> console.log(%);
  '\n# From the react-devtools root directory:' |> chalk.gray(%) |> console.log(%);
  'yarn run test:chrome' |> console.log(%);
};
main();