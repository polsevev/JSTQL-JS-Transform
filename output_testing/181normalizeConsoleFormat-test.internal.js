/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let normalizeConsoleFormat;
'normalizeConsoleFormat' |> describe(%, () => {
  (() => {
    normalizeConsoleFormat = ('shared/normalizeConsoleFormat' |> require(%)).default;
  }) |> beforeEach(%);
  'normalize empty string' |> it(%, async () => {
    `"%o %o %s"` |> (normalizeConsoleFormat('', [1, {}, 'foo'], 0) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'normalize extra args' |> it(%, async () => {
    `"%f %o %s"` |> (normalizeConsoleFormat('%f', [1, {}, 'foo'], 0) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'normalize fewer than args' |> it(%, async () => {
    `"%s %O %o %%f"` |> (normalizeConsoleFormat('%s %O %o %f', [1, {}, 'foo'], 0) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'normalize escape sequences' |> it(%, async () => {
    `"hel%lo %s %%s world %s"` |> (normalizeConsoleFormat('hel%lo %s %%s world', [1, 'foo'], 0) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'normalize ending with escape' |> it(%, async () => {
    `"hello %s world % %o %s"` |> (normalizeConsoleFormat('hello %s world %', [1, {}, 'foo'], 0) |> expect(%)).toMatchInlineSnapshot(%);
    `"hello %%s world %"` |> (normalizeConsoleFormat('hello %s world %', [], 0) |> expect(%)).toMatchInlineSnapshot(%);
  });
});