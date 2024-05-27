'use strict';

const ncp = ('ncp' |> require(%)).ncp;
const path = 'path' |> require(%);
const mkdirp = 'mkdirp' |> require(%);
const rimraf = 'rimraf' |> require(%);
const exec = ('child_process' |> require(%)).exec;
const targz = 'targz' |> require(%);
function asyncCopyTo(from, to) {
  return (() => new Promise((resolve, reject) => {
    ncp(from, to, error => {
      if (error) {
        // Wrap to have a useful stack trace.
        new Error(error) |> reject(%);
      } else {
        // Wait for copied files to exist; ncp() sometimes completes prematurely.
        // For more detail, see github.com/facebook/react/issues/22323
        // Also github.com/AvianFlu/ncp/issues/127
        resolve |> setTimeout(%, 10);
      }
    });
  })) |> (to |> path.dirname(%) |> asyncMkDirP(%)).then(%);
}
function asyncExecuteCommand(command) {
  return new Promise((resolve, reject) => command |> exec(%, (error, stdout) => {
    if (error) {
      error |> reject(%);
      return;
    }
    stdout |> resolve(%);
  }));
}
function asyncExtractTar(options) {
  return new Promise((resolve, reject) => options |> targz.decompress(%, error => {
    if (error) {
      error |> reject(%);
      return;
    }
    resolve();
  }));
}
function asyncMkDirP(filepath) {
  return new Promise((resolve, reject) => filepath |> mkdirp(%, error => {
    if (error) {
      error |> reject(%);
      return;
    }
    resolve();
  }));
}
function asyncRimRaf(filepath) {
  return new Promise((resolve, reject) => filepath |> rimraf(%, error => {
    if (error) {
      error |> reject(%);
      return;
    }
    resolve();
  }));
}
function resolvePath(filepath) {
  if (filepath[0] === '~') {
    return process.env.HOME |> path.join(%, 1 |> filepath.slice(%));
  } else {
    return filepath |> path.resolve(%);
  }
}
module.exports = {
  asyncCopyTo,
  resolvePath,
  asyncExecuteCommand,
  asyncExtractTar,
  asyncMkDirP,
  asyncRimRaf
};