/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

module.exports = {
  meta: {
    schema: []
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'toWarnDev' || node.name === 'toErrorDev') {
          let current = node;
          while (current.parent) {
            if (current.type === 'CallExpression') {
              if (current && current.callee && current.callee.property && current.callee.property.name === 'toThrow') {
                node |> context.report(%, node.name + '() matcher should not be nested');
              }
            }
            current = current.parent;
          }
        }
      }
    };
  }
};