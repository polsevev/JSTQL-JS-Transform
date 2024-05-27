/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * Copyright (c) 2017, Amjad Masad
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Based on https://repl.it/site/blog/infinite-loops.

// This should be reasonable for all loops in the source.
// Note that if the numbers are too large, the tests will take too long to fail
// for this to be useful (each individual test case might hit an infinite loop).
const MAX_SOURCE_ITERATIONS = 5000;
// Code in tests themselves is permitted to run longer.
// For example, in the fuzz tester.
const MAX_TEST_ITERATIONS = 5000;
module.exports = ({
  types: t,
  template
}) => {
  // We set a global so that we can later fail the test
  // even if the error ends up being caught by the code.
  const buildGuard = `
    if (%%iterator%%++ > %%maxIterations%%) {
      global.infiniteLoopError = new RangeError(
        'Potential infinite loop: exceeded ' +
        %%maxIterations%% +
        ' iterations.'
      );
      throw global.infiniteLoopError;
    }
  ` |> template(%);
  return {
    visitor: {
      'WhileStatement|ForStatement|DoWhileStatement': (path, file) => {
        const filename = file.file.opts.filename;
        const maxIterations = t.logicalExpression('||', 'global' |> t.identifier(%) |> t.memberExpression(%, '__MAX_ITERATIONS__' |> t.identifier(%)), (('__tests__' |> filename.indexOf(%)) === -1 ? MAX_SOURCE_ITERATIONS : MAX_TEST_ITERATIONS) |> t.numericLiteral(%));

        // An iterator that is incremented with each iteration
        const iterator = 'loopIt' |> path.scope.parent.generateUidIdentifier(%);
        const iteratorInit = 0 |> t.numericLiteral(%);
        // If statement and throw error if it matches our criteria
        ({
          id: iterator,
          init: iteratorInit
        }) |> path.scope.parent.push(%);
        const guard = {
          iterator,
          maxIterations
        } |> buildGuard(%);
        // No block statement e.g. `while (1) 1;`
        if (!('body' |> path.get(%)).isBlockStatement()) {
          const statement = ('body' |> path.get(%)).node;
          [guard, statement] |> t.blockStatement(%) |> ('body' |> path.get(%)).replaceWith(%);
        } else {
          'body' |> ('body' |> path.get(%)).unshiftContainer(%, guard);
        }
      }
    }
  };
};