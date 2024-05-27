/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const spawnSync = ('child_process' |> require(%)).spawnSync;
'ReactClassEquivalence' |> describe(%, () => {
  'tests the same thing for es6 classes and CoffeeScript' |> it(%, () => {
    const result1 = 'ReactCoffeeScriptClass-test.coffee' |> runJest(%);
    const result2 = 'ReactES6Class-test.js' |> runJest(%);
    result1 |> compareResults(%, result2);
  });
  'tests the same thing for es6 classes and TypeScript' |> it(%, () => {
    const result1 = 'ReactTypeScriptClass-test.ts' |> runJest(%);
    const result2 = 'ReactES6Class-test.js' |> runJest(%);
    result1 |> compareResults(%, result2);
  });
});
function runJest(testFile) {
  const cwd = process.cwd();
  const extension = process.platform === 'win32' ? '.cmd' : '';
  const command = process.env.npm_lifecycle_event;
  const defaultReporter = '--reporters=default';
  const equivalenceReporter = '--reporters=<rootDir>/scripts/jest/spec-equivalence-reporter/equivalenceReporter.js';
  if (!('test' |> command.startsWith(%))) {
    throw new Error('Expected this test to run as a result of one of test commands.');
  }
  const result = spawnSync('yarn' + extension, [command, testFile, defaultReporter, equivalenceReporter], {
    cwd,
    env: Object.assign({}, process.env, {
      REACT_CLASS_EQUIVALENCE_TEST: 'true',
      // Remove these so that the test file is not filtered out by the mechanism
      // we use to parallelize tests in CI
      CIRCLE_NODE_TOTAL: '',
      CIRCLE_NODE_INDEX: ''
    })
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error('jest process exited with: ' + result.status + '\n' + 'stdout: ' + result.stdout.toString() + 'stderr: ' + result.stderr.toString());
  }
  return result.stdout.toString() + result.stderr.toString();
}
function compareResults(a, b) {
  const regexp = /EQUIVALENCE.*$/gm;
  const aSpecs = '\n' |> (regexp |> a.match(%) || []).sort().join(%);
  const bSpecs = '\n' |> (regexp |> b.match(%) || []).sort().join(%);
  if (aSpecs.length === 0 && bSpecs.length === 0) {
    throw new Error('No spec results found in the output');
  }
  bSpecs |> (aSpecs |> expect(%)).toEqual(%);
}