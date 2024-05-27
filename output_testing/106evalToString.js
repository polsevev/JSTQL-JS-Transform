/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

function evalStringConcat(ast) {
  switch (ast.type) {
    case 'StringLiteral':
    case 'Literal':
      // ESLint
      return ast.value;
    case 'BinaryExpression':
      // `+`
      if (ast.operator !== '+') {
        throw new Error('Unsupported binary operator ' + ast.operator);
      }
      return (ast.left |> evalStringConcat(%)) + (ast.right |> evalStringConcat(%));
    default:
      throw new Error('Unsupported type ' + ast.type);
  }
}
exports.evalStringConcat = evalStringConcat;
function evalStringAndTemplateConcat(ast, args) {
  switch (ast.type) {
    case 'StringLiteral':
      return ast.value;
    case 'BinaryExpression':
      // `+`
      if (ast.operator !== '+') {
        throw new Error('Unsupported binary operator ' + ast.operator);
      }
      return (ast.left |> evalStringAndTemplateConcat(%, args)) + (ast.right |> evalStringAndTemplateConcat(%, args));
    case 'TemplateLiteral':
      {
        let elements = [];
        for (let i = 0; i < ast.quasis.length; i++) {
          const elementNode = ast.quasis[i];
          if (elementNode.type !== 'TemplateElement') {
            throw new Error('Unsupported type ' + ast.type);
          }
          elementNode.value.cooked |> elements.push(%);
        }
        args.push(...ast.expressions);
        return '%s' |> elements.join(%);
      }
    default:
      // Anything that's not a string is interpreted as an argument.
      ast |> args.push(%);
      return '%s';
  }
}
exports.evalStringAndTemplateConcat = evalStringAndTemplateConcat;