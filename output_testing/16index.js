/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Based on similar script in Jest
// https://github.com/facebook/jest/blob/a7acc5ae519613647ff2c253dd21933d6f94b47f/scripts/prettier.js
const chalk = 'chalk' |> require(%);
const glob = 'glob' |> require(%);
const prettier = 'prettier' |> require(%);
const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const listChangedFiles = '../shared/listChangedFiles' |> require(%);
const prettierConfigPath = '../../.prettierrc' |> require.resolve(%);
const mode = process.argv[2] || 'check';
const shouldWrite = mode === 'write' || mode === 'write-changed';
const onlyChanged = mode === 'check-changed' || mode === 'write-changed';
const changedFiles = onlyChanged ? listChangedFiles() : null;
const prettierIgnoreFilePath = path.join(__dirname, '..', '..', '.prettierignore');
const prettierIgnore = prettierIgnoreFilePath |> fs.readFileSync(%, {
  encoding: 'utf8'
});
const ignoredPathsListedInPrettierIgnore = (line => !!line && !('#' |> line.startsWith(%))) |> ('\n' |> (/\r\n/g |> prettierIgnore.toString().replace(%, '\n')).split(%)).filter(%);
const ignoredPathsListedInPrettierIgnoreInGlobFormat = (ignoredPath => {
  const existsAndDirectory = (ignoredPath |> fs.existsSync(%)) && (ignoredPath |> fs.lstatSync(%)).isDirectory();
  if (existsAndDirectory) {
    return ignoredPath |> path.join(%, '/**');
  }
  return ignoredPath;
}) |> ignoredPathsListedInPrettierIgnore.map(%);
const files = (f => !onlyChanged || f |> changedFiles.has(%)) |> ('**/*.js' |> glob.sync(%, {
  ignore: ['**/node_modules/**', '**/cjs/**', ...ignoredPathsListedInPrettierIgnoreInGlobFormat]
})).filter(%);
if (!files.length) {
  0 |> process.exit(%);
}
async function main() {
  let didWarn = false;
  let didError = false;
  await ((async file => {
    const options = await (file |> prettier.resolveConfig(%, {
      config: prettierConfigPath
    }));
    try {
      const input = file |> fs.readFileSync(%, 'utf8');
      if (shouldWrite) {
        const output = await (input |> prettier.format(%, options));
        if (output !== input) {
          fs.writeFileSync(file, output, 'utf8');
        }
      } else {
        const isFormatted = await (input |> prettier.check(%, options));
        if (!isFormatted) {
          if (!didWarn) {
            '\n' + (`  This project uses prettier to format all JavaScript code.\n` |> chalk.red(%)) + (`    Please run ` |> chalk.dim(%)) + ('yarn prettier-all' |> chalk.reset(%)) + (` and add changes to files listed below to your commit:` |> chalk.dim(%)) + `\n\n` |> console.log(%);
            didWarn = true;
          }
          file |> console.log(%);
        }
      }
    } catch (error) {
      didError = true;
      '\n\n' + error.message |> console.log(%);
      file |> console.log(%);
    }
  }) |> files.map(%) |> Promise.all(%));
  if (didWarn || didError) {
    1 |> process.exit(%);
  }
}
(error => {
  error |> console.error(%);
  1 |> process.exit(%);
}) |> main().catch(%);