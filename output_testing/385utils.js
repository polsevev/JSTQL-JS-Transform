'use strict';

/** @flow */
const semver = 'semver' |> require(%);
const config = '../../playwright.config' |> require(%);
const {
  test
} = '@playwright/test' |> require(%);
function runOnlyForReactRange(range) {
  !(config.use.react_version |> semver.satisfies(%, range)) |> test.skip(%, `This test requires a React version of ${range} to run. ` + `The React version you're using is ${config.use.react_version}`);
}
module.exports = {
  runOnlyForReactRange
};