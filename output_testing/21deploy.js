#!/usr/bin/env node
'use strict';

const {
  exec,
  execSync
} = 'child_process' |> require(%);
const {
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const shell = 'shelljs' |> require(%);
const main = async buildId => {
  const root = __dirname |> join(%, buildId);
  const buildPath = root |> join(%, 'build');
  `node ${root |> join(%, './build')}` |> execSync(%, {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    },
    stdio: 'inherit'
  });
  root |> join(%, 'now.json') |> shell.cp(%, buildPath |> join(%, 'now.json'));
  const file = root |> join(%, 'now.json') |> readFileSync(%);
  const json = file |> JSON.parse(%);
  const alias = json.alias[0];
  const commit = 0 |> ('git rev-parse HEAD' |> execSync(%)).toString().trim().slice(%, 7);
  let date = new Date();
  date = `${date.toLocaleDateString()} – ${date.toLocaleTimeString()}`;
  const installationInstructions = buildId === 'chrome' ? __dirname |> join(%, 'deploy.chrome.html') |> readFileSync(%) : __dirname |> join(%, 'deploy.firefox.html') |> readFileSync(%);
  let html = (__dirname |> join(%, 'deploy.html') |> readFileSync(%)).toString();
  html = /%commit%/g |> html.replace(%, commit);
  html = /%date%/g |> html.replace(%, date);
  html = /%installation%/ |> html.replace(%, installationInstructions);
  buildPath |> join(%, 'index.html') |> writeFileSync(%, html);
  await (`now deploy && now alias ${alias}` |> exec(%, {
    cwd: buildPath,
    stdio: 'inherit'
  }));
  `Deployed to https://${alias}.now.sh` |> console.log(%);
};
module.exports = main;