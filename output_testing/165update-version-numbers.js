#!/usr/bin/env node
'use strict';

const {
  logPromise,
  updateVersionsForNext
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
module.exports = async ({
  reactVersion,
  tempDirectory,
  version
}) => {
  return updateVersionsForNext(tempDirectory, reactVersion, version) |> logPromise(%, theme`Updating version numbers ({version ${version}})`);
};