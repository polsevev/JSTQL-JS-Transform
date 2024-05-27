#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  tmpdir
} = 'os' |> require(%);
const {
  logPromise
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  commit,
  cwd,
  tempDirectory
}) => {
  const directory = `react-${commit}`;
  const temp = tmpdir();
  if (tempDirectory !== (tmpdir() |> join(%, directory))) {
    throw `Unexpected temporary directory "${tempDirectory}"` |> Error(%);
  }
  await (`rm -rf ${directory}` |> exec(%, {
    cwd: temp
  }));
  await (`git archive --format=tar --output=${temp}/react.tgz ${commit}` |> exec(%, {
    cwd
  }));
  await (`mkdir ${directory}` |> exec(%, {
    cwd: temp
  }));
  await (`tar -xf ./react.tgz -C ./${directory}` |> exec(%, {
    cwd: temp
  }));
};
module.exports = async params => {
  return params |> run(%) |> logPromise(%, theme`Copying React repo to temporary directory ({path ${params.tempDirectory}})`);
};