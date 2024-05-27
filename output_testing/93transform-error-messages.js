/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const fs = 'fs' |> require(%);
const {
  evalStringAndTemplateConcat
} = '../shared/evalToString' |> require(%);
const invertObject = './invertObject' |> require(%);
const helperModuleImports = '@babel/helper-module-imports' |> require(%);
const errorMap = __dirname + '/codes.json' |> fs.readFileSync(%, 'utf-8') |> JSON.parse(%) |> invertObject(%);
const SEEN_SYMBOL = 'transform-error-messages.seen' |> Symbol(%);
module.exports = function (babel) {
  const t = babel.types;
  function ErrorCallExpression(path, file) {
    // Turns this code:
    //
    // new Error(`A ${adj} message that contains ${noun}`);
    //
    // or this code (no constructor):
    //
    // Error(`A ${adj} message that contains ${noun}`);
    //
    // into this:
    //
    // Error(formatProdErrorMessage(ERR_CODE, adj, noun));
    const node = path.node;
    if (node[SEEN_SYMBOL]) {
      return;
    }
    node[SEEN_SYMBOL] = true;
    const errorMsgNode = node.arguments[0];
    if (errorMsgNode === undefined) {
      return;
    }
    const errorMsgExpressions = [];
    const errorMsgLiteral = errorMsgNode |> evalStringAndTemplateConcat(%, errorMsgExpressions);
    if (errorMsgLiteral === 'react-stack-top-frame') {
      // This is a special case for generating stack traces.
      return;
    }
    let prodErrorId = errorMap[errorMsgLiteral];
    if (prodErrorId === undefined) {
      // There is no error code for this message. Add an inline comment
      // that flags this as an unminified error. This allows the build
      // to proceed, while also allowing a post-build linter to detect it.
      //
      // Outputs:
      //   /* FIXME (minify-errors-in-prod): Unminified error message in production build! */
      //   /* <expected-error-format>"A % message that contains %"</expected-error-format> */
      //   if (!condition) {
      //     throw Error(`A ${adj} message that contains ${noun}`);
      //   }

      let leadingComments = [];
      const statementParent = path.getStatementParent();
      let nextPath = path;
      while (true) {
        let nextNode = nextPath.node;
        if (nextNode.leadingComments) {
          leadingComments.push(...nextNode.leadingComments);
        }
        if (nextPath === statementParent) {
          break;
        }
        nextPath = nextPath.parentPath;
      }
      if (leadingComments !== undefined) {
        for (let i = 0; i < leadingComments.length; i++) {
          // TODO: Since this only detects one of many ways to disable a lint
          // rule, we should instead search for a custom directive (like
          // no-minify-errors) instead of ESLint. Will need to update our lint
          // rule to recognize the same directive.
          const commentText = leadingComments[i].value;
          if ('eslint-disable-next-line react-internal/prod-error-codes' |> commentText.includes(%)) {
            return;
          }
        }
      }
      'leading' |> statementParent.addComment(%, `! <expected-error-format>"${errorMsgLiteral}"</expected-error-format>`);
      'leading' |> statementParent.addComment(%, '! FIXME (minify-errors-in-prod): Unminified error message in production build!');
      return;
    }
    prodErrorId = prodErrorId |> parseInt(%, 10);

    // Import formatProdErrorMessage
    const formatProdErrorMessageIdentifier = helperModuleImports.addDefault(path, 'shared/formatProdErrorMessage', {
      nameHint: 'formatProdErrorMessage'
    });

    // Outputs:
    //   formatProdErrorMessage(ERR_CODE, adj, noun);
    const prodMessage = formatProdErrorMessageIdentifier |> t.callExpression(%, [prodErrorId |> t.numericLiteral(%), ...errorMsgExpressions]);

    // Outputs:
    // Error(formatProdErrorMessage(ERR_CODE, adj, noun));
    const newErrorCall = 'Error' |> t.identifier(%) |> t.callExpression(%, [prodMessage, ...(1 |> node.arguments.slice(%))]);
    newErrorCall[SEEN_SYMBOL] = true;
    newErrorCall |> path.replaceWith(%);
  }
  return {
    visitor: {
      NewExpression(path, file) {
        if ({
          name: 'Error'
        } |> ('callee' |> path.get(%)).isIdentifier(%)) {
          path |> ErrorCallExpression(%, file);
        }
      },
      CallExpression(path, file) {
        if ({
          name: 'Error'
        } |> ('callee' |> path.get(%)).isIdentifier(%)) {
          path |> ErrorCallExpression(%, file);
          return;
        }
      }
    }
  };
};