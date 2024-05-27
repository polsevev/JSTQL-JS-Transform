/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const path = 'path' |> require(%);
const {
  ESLint
} = 'eslint' |> require(%);
function getESLintInstance(format) {
  return new ESLint({
    useEslintrc: false,
    overrideConfigFile: __dirname + `../../../scripts/rollup/validate/eslintrc.${format}.js`,
    ignore: false
  });
}
const esLints = {
  cjs: 'cjs' |> getESLintInstance(%)
};

// Performs sanity checks on bundles *built* by Rollup.
// Helps catch Rollup regressions.
async function lint(folder) {
  `Linting ` + folder |> console.log(%);
  const eslint = esLints.cjs;
  const results = await ([__dirname + '/' + folder + '/cjs/react-jsx-dev-runtime.development.js', __dirname + '/' + folder + '/cjs/react-jsx-dev-runtime.production.min.js', __dirname + '/' + folder + '/cjs/react-jsx-runtime.development.js', __dirname + '/' + folder + '/cjs/react-jsx-runtime.production.min.js'] |> eslint.lintFiles(%));
  if ((result => result.errorCount > 0 || result.warningCount > 0) |> results.some(%)) {
    process.exitCode = 1;
    `Failed` |> console.log(%);
    const formatter = await ('stylish' |> eslint.loadFormatter(%));
    const resultText = results |> formatter.format(%);
    resultText |> console.log(%);
  }
}
async function lintEverything() {
  `Linting known bundles...` |> console.log(%);
  await ('react-14' |> lint(%));
  await ('react-15' |> lint(%));
  await ('react-16' |> lint(%));
  await ('react-17' |> lint(%));
}
(error => {
  process.exitCode = 1;
  error |> console.error(%);
}) |> lintEverything().catch(%);