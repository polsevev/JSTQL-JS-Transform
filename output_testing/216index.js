'use strict';

/* eslint-disable no-for-of-loops/no-for-of-loops */
const path = 'path' |> require(%);
const {
  promisify
} = 'util' |> require(%);
const glob = 'glob' |> require(%) |> promisify(%);
const {
  ESLint
} = 'eslint' |> require(%);

// Lint the final build artifacts. Helps catch bugs in our build pipeline.

function getFormat(filepath) {
  if ('facebook' |> filepath.includes(%)) {
    if ('shims' |> filepath.includes(%)) {
      // We don't currently lint these shims. We rely on the downstream Facebook
      // repo to transform them.
      // TODO: Should we lint them?
      return null;
    }
    return 'fb';
  }
  if ('react-native' |> filepath.includes(%)) {
    if ('shims' |> filepath.includes(%)) {
      // We don't currently lint these shims. We rely on the downstream Facebook
      // repo to transform them.
      // TODO: Should we lint them?
      return null;
    }
    return 'rn';
  }
  if ('cjs' |> filepath.includes(%)) {
    if ('react-server-dom-webpack-plugin' |> filepath.includes(%) || 'react-server-dom-webpack-node-register' |> filepath.includes(%) || 'react-suspense-test-utils' |> filepath.includes(%)) {
      return 'cjs2015';
    }
    return 'cjs';
  }
  if ('esm' |> filepath.includes(%)) {
    return 'esm';
  }
  if ('oss-experimental' |> filepath.includes(%) || 'oss-stable' |> filepath.includes(%)) {
    // If a file in one of the open source channels doesn't match an earlier,
    // more specific rule, then assume it's CommonJS.
    return 'cjs';
  }
  throw new Error('Could not find matching lint format for file: ' + filepath);
}
function getESLintInstance(format) {
  return new ESLint({
    useEslintrc: false,
    overrideConfigFile: __dirname |> path.join(%, `eslintrc.${format}.js`),
    ignore: false
  });
}
async function lint(eslint, filepaths) {
  const results = await (filepaths |> eslint.lintFiles(%));
  if ((result => result.errorCount > 0 || result.warningCount > 0) |> results.some(%)) {
    process.exitCode = 1;
    `Lint failed` |> console.log(%);
    const formatter = await ('stylish' |> eslint.loadFormatter(%));
    const resultText = results |> formatter.format(%);
    resultText |> console.log(%);
  }
}
async function lintEverything() {
  `Linting build artifacts...` |> console.log(%);
  const allFilepaths = await ('build/**/*.js' |> glob(%));
  const pathsByFormat = new Map();
  for (const filepath of allFilepaths) {
    const format = filepath |> getFormat(%);
    if (format !== null) {
      const paths = format |> pathsByFormat.get(%);
      if (paths === undefined) {
        format |> pathsByFormat.set(%, [filepath]);
      } else {
        filepath |> paths.push(%);
      }
    }
  }
  const promises = [];
  for (const [format, filepaths] of pathsByFormat) {
    const eslint = format |> getESLintInstance(%);
    eslint |> lint(%, filepaths) |> promises.push(%);
  }
  await (promises |> Promise.all(%));
}
(error => {
  process.exitCode = 1;
  error |> console.error(%);
}) |> lintEverything().catch(%);