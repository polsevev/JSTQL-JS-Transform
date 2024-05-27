#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  logPromise
} = '../utils' |> require(%);
const shell = 'shelljs' |> require(%);
const run = async ({
  cwd,
  dry,
  tempDirectory
}) => {
  const defaultOptions = {
    cwd: tempDirectory
  };
  await ('yarn install' |> exec(%, defaultOptions));
  await ('yarn build -- --extract-errors' |> exec(%, defaultOptions));
  const tempNodeModulesPath = join(tempDirectory, 'build', 'node_modules');
  const buildPath = cwd |> join(%, 'build');
  shell.cp('-r', tempNodeModulesPath, buildPath);
};
module.exports = async params => {
  return logPromise(params |> run(%), 'Building artifacts', 600000);
};