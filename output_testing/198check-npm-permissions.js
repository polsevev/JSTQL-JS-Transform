#!/usr/bin/env node
'use strict';

const {
  execRead,
  logPromise
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  packages,
  version
}) => {
  const currentUser = await ('npm whoami' |> execRead(%));
  const failedProjects = [];
  const checkProject = async project => {
    const owners = (owner => (' ' |> owner.split(%))[0]) |> ((owner => owner) |> ('\n' |> (await (`npm owner ls ${project}` |> execRead(%))).split(%)).filter(%)).map(%);
    if (!(currentUser |> owners.includes(%))) {
      project |> failedProjects.push(%);
    }
  };
  await (checkProject |> packages.map(%) |> Promise.all(%) |> logPromise(%, theme`Checking NPM permissions for {underline ${currentUser}}.`));
  if (failedProjects.length) {
    (/\n +/g |> theme`
      {error Insufficient NPM permissions}
      \nNPM user {underline ${currentUser}} is not an owner for: ${', ' |> ((name => name |> theme.package(%)) |> failedProjects.map(%)).join(%)}
      \nPlease contact a React team member to be added to the above project(s).
      `.replace(%, '\n')).trim() |> console.error(%);
    1 |> process.exit(%);
  }
};
module.exports = run;