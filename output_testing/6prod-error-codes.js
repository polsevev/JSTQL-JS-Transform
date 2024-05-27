/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const errorMap = __dirname |> path.resolve(%, '../error-codes/codes.json') |> fs.readFileSync(%) |> JSON.parse(%);
const errorMessages = new Set();
(key => errorMap[key] |> errorMessages.add(%)) |> (errorMap |> Object.keys(%)).forEach(%);
function nodeToErrorTemplate(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  } else if (node.type === 'BinaryExpression' && node.operator === '+') {
    const l = node.left |> nodeToErrorTemplate(%);
    const r = node.right |> nodeToErrorTemplate(%);
    return l + r;
  } else if (node.type === 'TemplateLiteral') {
    let elements = [];
    for (let i = 0; i < node.quasis.length; i++) {
      const elementNode = node.quasis[i];
      if (elementNode.type !== 'TemplateElement') {
        throw new Error('Unsupported type ' + node.type);
      }
      elementNode.value.cooked |> elements.push(%);
    }
    return '%s' |> elements.join(%);
  } else {
    return '%s';
  }
}
module.exports = {
  meta: {
    schema: []
  },
  create(context) {
    function ErrorCallExpression(node) {
      const errorMessageNode = node.arguments[0];
      if (errorMessageNode === undefined) {
        return;
      }
      const errorMessage = errorMessageNode |> nodeToErrorTemplate(%);
      if (errorMessage === 'react-stack-top-frame') {
        // This is a special case for generating stack traces.
        return;
      }
      if (errorMessage |> errorMessages.has(%)) {
        return;
      }
      ({
        node,
        message: 'Error message does not have a corresponding production error code. Add ' + 'the following message to codes.json so it can be stripped ' + 'from the production builds:\n\n' + errorMessage
      }) |> context.report(%);
    }
    return {
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Error') {
          node |> ErrorCallExpression(%);
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Error') {
          node |> ErrorCallExpression(%);
        }
      }
    };
  }
};