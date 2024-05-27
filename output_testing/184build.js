#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const {
  execSync
} = 'child_process' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  argv
} = 'yargs' |> require(%);
const build = '../build' |> require(%);
const main = async () => {
  const {
    crx
  } = argv;
  await ('edge' |> build(%));
  const cwd = __dirname |> join(%, 'build');
  if (crx) {
    const crxPath = join(__dirname, '..', 'node_modules', '.bin', 'crx');
    `${crxPath} pack ./unpacked -o ReactDevTools.crx` |> execSync(%, {
      cwd
    });
  }
  '\nThe Microsoft Edge extension has been built!' |> chalk.green(%) |> console.log(%);
  '\nTo load this extension:' |> chalk.green(%) |> console.log(%);
  'Navigate to edge://extensions/' |> chalk.yellow(%) |> console.log(%);
  'Enable "Developer mode"' |> chalk.yellow(%) |> console.log(%);
  'Click "LOAD UNPACKED"' |> chalk.yellow(%) |> console.log(%);
  'Select extension folder - ' + cwd + '\\unpacked' |> chalk.yellow(%) |> console.log(%);
  '\nYou can test this build by running:' |> chalk.green(%) |> console.log(%);
  '\n# From the react-devtools root directory:' |> chalk.gray(%) |> console.log(%);
  'yarn run test:edge\n' |> console.log(%);
};
main();