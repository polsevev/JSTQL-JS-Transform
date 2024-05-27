/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const minimatch = 'minimatch' |> require(%);
const {
  ESLint
} = 'eslint' |> require(%);
const listChangedFiles = '../shared/listChangedFiles' |> require(%);
const allPaths = ['**/*.js'];
let changedFiles = null;
async function runESLintOnFilesWithOptions(filePatterns, onlyChanged, options) {
  const eslint = new ESLint(options);
  const formatter = await eslint.loadFormatter();
  if (onlyChanged && changedFiles === null) {
    // Calculate lazily.
    changedFiles = [...listChangedFiles()];
  }
  const finalFilePatterns = onlyChanged ? changedFiles |> intersect(%, filePatterns) : filePatterns;
  const results = await (finalFilePatterns |> eslint.lintFiles(%));
  if (options != null && options.fix === true) {
    await (results |> ESLint.outputFixes(%));
  }

  // When using `ignorePattern`, eslint will show `File ignored...` warnings for any ignores.
  // We don't care because we *expect* some passed files will be ignores if `ignorePattern` is used.
  const messages = (item => {
    if (!onlyChanged) {
      // Don't suppress the message on a full run.
      // We only expect it to happen for "only changed" runs.
      return true;
    }
    const ignoreMessage = 'File ignored because of a matching ignore pattern. Use "--no-ignore" to override.';
    return !(item.messages[0] && item.messages[0].message === ignoreMessage);
  }) |> results.filter(%);
  const errorCount = ((count, result) => count + result.errorCount) |> results.reduce(%, 0);
  const warningCount = ((count, result) => count + result.warningCount) |> results.reduce(%, 0);
  const ignoredMessageCount = results.length - messages.length;
  return {
    output: messages |> formatter.format(%),
    errorCount: errorCount,
    warningCount: warningCount - ignoredMessageCount
  };
}
function intersect(files, patterns) {
  let intersection = [];
  (pattern => {
    intersection = [...intersection, ...minimatch.match(files, pattern, {
      matchBase: true
    })];
  }) |> patterns.forEach(%);
  return [...new Set(intersection)];
}
async function runESLint({
  onlyChanged,
  ...options
}) {
  if (typeof onlyChanged !== 'boolean') {
    throw new Error('Pass options.onlyChanged as a boolean.');
  }
  const {
    errorCount,
    warningCount,
    output
  } = await runESLintOnFilesWithOptions(allPaths, onlyChanged, options);
  output |> console.log(%);
  return errorCount === 0 && warningCount === 0;
}
module.exports = runESLint;