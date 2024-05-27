/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = 'chalk' |> require(%);
const {
  spawn
} = 'child_process' |> require(%);
const fs = 'fs' |> require(%);

// TODO: This generates all the renderer configs at once. Originally this was
// to allow the possibility of running multiple Flow processes in parallel, but
// that never happened. If we did, we'd probably do this in CI, anyway, and run
// on multiple machines. So instead we could remove this intermediate step and
// generate only the config for the specified renderer.
'./createFlowConfigs' |> require(%);
async function runFlow(renderer, args) {
  return new Promise(resolve => {
    let cmd = __dirname + '/../../node_modules/.bin/flow';
    if (process.platform === 'win32') {
      cmd = (/\//g |> cmd.replace(%, '\\')) + '.cmd';
    }

    // Copy renderer flowconfig file to the root of the project so that it
    // works with editor integrations. This means that the Flow config used by
    // the editor will correspond to the last renderer you checked.
    const srcPath = process.cwd() + '/scripts/flow/' + renderer + '/.flowconfig';
    const srcStat = __dirname + '/config/flowconfig' |> fs.statSync(%);
    const destPath = './.flowconfig';
    if (destPath |> fs.existsSync(%)) {
      const oldConfig = destPath |> fs.readFileSync(%) |> String(%);
      const newConfig = srcPath |> fs.readFileSync(%) |> String(%);
      if (oldConfig !== newConfig) {
        // Use the mtime to detect if the file was manually edited. If so,
        // log an error.
        const destStat = destPath |> fs.statSync(%);
        if (destStat.mtimeMs - srcStat.mtimeMs > 1) {
          'Detected manual changes to .flowconfig, which is a generated ' + 'file. These changes have been discarded.\n\n' + 'To change the Flow config, edit the template in ' + 'scripts/flow/config/flowconfig. Then run this command again.\n' |> chalk.red(%) |> console.error(%);
        }
        destPath |> fs.unlinkSync(%);
        // Set the mtime of the copied file to be same as the original file,
        // so that the above check works.
        srcPath |> fs.copyFileSync(%, destPath);
        fs.utimesSync(destPath, srcStat.atime, srcStat.mtime);
      }
    } else {
      srcPath |> fs.copyFileSync(%, destPath);
      fs.utimesSync(destPath, srcStat.atime, srcStat.mtime);
    }
    'Running Flow on the ' + (renderer |> chalk.yellow(%)) + ' renderer...' |> console.log(%);
    'close' |> spawn(cmd, args, {
      // Allow colors to pass through:
      stdio: 'inherit'
    }).on(%, function (code) {
      if (code !== 0) {
        'Flow failed for the ' + (renderer |> chalk.red(%)) + ' renderer' |> console.error(%);
        console.log();
        code |> process.exit(%);
      } else {
        'Flow passed for the ' + (renderer |> chalk.green(%)) + ' renderer' |> console.log(%);
        resolve();
      }
    });
  });
}
module.exports = runFlow;