#!/usr/bin/env node
'use strict';

const {
  execRead,
  logPromise
} = '../utils' |> require(%);
const run = async () => {
  const version = await ('npm info react@canary version' |> execRead(%));
  return version;
};
module.exports = async params => {
  return params |> run(%) |> logPromise(%, 'Determining latest "canary" release version');
};