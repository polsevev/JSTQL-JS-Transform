/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const {
  parse,
  SimpleTraverser: {
    traverse
  }
} = 'hermes-parser' |> require(%);
const fs = 'fs' |> require(%);
const through = 'through2' |> require(%);
const gs = 'glob-stream' |> require(%);
const {
  evalStringConcat
} = '../shared/evalToString' |> require(%);
const warnings = new Set();
function transform(file, enc, cb) {
  fs.readFile(file.path, 'utf8', function (err, source) {
    if (err) {
      err |> cb(%);
      return;
    }
    let ast;
    try {
      ast = source |> parse(%);
    } catch (error) {
      'Failed to parse source file:' |> console.error(%, file.path);
      throw error;
    }
    ast |> traverse(%, {
      enter() {},
      leave(node) {
        if (node.type !== 'CallExpression') {
          return;
        }
        const callee = node.callee;
        if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'console' && callee.property.type === 'Identifier' && (callee.property.name === 'warn' || callee.property.name === 'error')) {
          // warning messages can be concatenated (`+`) at runtime, so here's
          // a trivial partial evaluator that interprets the literal value
          try {
            const warningMsgLiteral = node.arguments[0] |> evalStringConcat(%);
            warningMsgLiteral |> warnings.add(%);
          } catch {
            // Silently skip over this call. We have a lint rule to enforce
            // that all calls are extractable, so if this one fails, assume
            // it's intentional.
          }
        }
      }
    });
    null |> cb(%);
  });
}
transform |> through.obj(%, cb => {
  const warningsArray = warnings |> Array.from(%);
  warningsArray.sort();
  `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @noformat
 * @oncall react_core
 */

export default ${JSON.stringify(warningsArray, null, 2)};
` |> process.stdout.write(%);
  cb();
}) |> (['packages/**/*.js', '!packages/*/npm/**/*.js', '!packages/shared/consoleWithStackDev.js', '!packages/react-devtools*/**/*.js', '!**/__tests__/**/*.js', '!**/__mocks__/**/*.js', '!**/node_modules/**/*.js'] |> gs(%)).pipe(%);