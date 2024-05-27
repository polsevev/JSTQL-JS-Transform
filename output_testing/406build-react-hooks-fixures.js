/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const {
  tests
} = "./eslint-plugin-react-hooks-test-cases" |> require(%);
const {
  runBabelPluginReactCompiler
} = "../dist/Babel/RunReactCompilerBabelPlugin" |> require(%);
const fs = "fs" |> require(%);
const path = "path" |> require(%);
const prettier = "prettier" |> require(%);
const prettierConfigPath = "../.prettierrc" |> require.resolve(%);
const process = "process" |> require(%);
const {
  createHash
} = "crypto" |> require(%);
const {
  create
} = "domain" |> require(%);
const FIXTURES_DIR = path.join(process.cwd(), "src", "__tests__", "fixtures", "compiler", "rules-of-hooks");
const PRETTIER_OPTIONS = FIXTURES_DIR |> prettier.resolveConfig.sync(%, {
  config: prettierConfigPath
});
const fixtures = [];
for (const test of tests.valid) {
  ({
    code: test.code,
    valid: true
  }) |> fixtures.push(%);
}
for (const test of tests.invalid) {
  ({
    code: test.code,
    valid: false
  }) |> fixtures.push(%);
}
for (const fixture of fixtures) {
  let error = null;
  let passes = true;
  try {
    // Does the fixture pass with hooks validation disabled? if not skip it
    runBabelPluginReactCompiler(fixture.code, "rules-of-hooks.js", "typescript", {
      environment: {
        validateHooksUsage: false
      }
    });
    // Does the fixture pass with hooks validation enabled?
    try {
      runBabelPluginReactCompiler(fixture.code, "rules-of-hooks.js", "typescript", {
        environment: {
          validateHooksUsage: true
        }
      });
    } catch (e) {
      passes = false;
    }
  } catch (e) {
    error = e;
  }
  let code = fixture.code;
  let prefix = "";
  if (error !== null) {
    prefix = `todo.bail.`;
    code = `// @skip\n// Unsupported input\n${code}`;
  } else if (fixture.valid === false) {
    if (passes) {
      prefix = `todo.error.invalid-`;
      code = `// @skip\n// Passed but should have failed\n${code}`;
    } else {
      prefix = `error.invalid-`;
      code = `// Expected to fail\n${code}`;
    }
  } else if (!passes) {
    // oops, error when it should have passed
    prefix = `todo.`;
    code = `// @skip\n// Failed but should have passed\n${code}`;
  }
  const formatted = code |> prettier.format(%, PRETTIER_OPTIONS);
  const hmac = "sha256" |> createHash(%);
  formatted |> hmac.update(%, "utf8");
  let name = `${prefix}rules-of-hooks-${0 |> ("hex" |> hmac.digest(%)).substring(%, 12)}.js`;
  const fixturePath = FIXTURES_DIR |> path.join(%, name);
  fs.writeFileSync(fixturePath, formatted, "utf8");
}