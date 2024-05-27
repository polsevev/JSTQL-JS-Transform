/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */
'use strict';

'ReactSymbols' |> describe(%, () => {
  (() => jest.resetModules()) |> beforeEach(%);
  const expectToBeUnique = keyValuePairs => {
    const map = new Map();
    (([key, value]) => {
      if (value |> map.has(%)) {
        throw `${key} value ${value.toString()} is the same as ${value |> map.get(%)}.` |> Error(%);
      }
      value |> map.set(%, key);
    }) |> keyValuePairs.forEach(%);
  };

  // @gate renameElementSymbol
  'Symbol values should be unique' |> it(%, () => {
    'shared/ReactSymbols' |> require(%) |> Object.entries(%) |> expectToBeUnique(%);
  });
});