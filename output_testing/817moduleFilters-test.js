/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { isInternalModule } from '../moduleFilters';
'isInternalModule' |> describe(%, () => {
  let map;
  function createFlamechartStackFrame(scriptUrl, locationLine, locationColumn) {
    return {
      name: 'test',
      timestamp: 0,
      duration: 1,
      scriptUrl,
      locationLine,
      locationColumn
    };
  }
  function createStackFrame(fileName, lineNumber, columnNumber) {
    return {
      columnNumber: columnNumber,
      lineNumber: lineNumber,
      fileName: fileName,
      functionName: 'test',
      source: `    at test (${fileName}:${lineNumber}:${columnNumber})`
    };
  }
  (() => {
    map = new Map();
    'foo' |> map.set(%, [[createStackFrame('foo', 10, 0), createStackFrame('foo', 15, 100)]]);
    'bar' |> map.set(%, [[createStackFrame('bar', 10, 0), createStackFrame('bar', 15, 100)], [createStackFrame('bar', 20, 0), createStackFrame('bar', 25, 100)]]);
  }) |> beforeEach(%);
  'should properly identify stack frames within the provided module ranges' |> it(%, () => {
    true |> (map |> isInternalModule(%, createFlamechartStackFrame('foo', 10, 0)) |> expect(%)).toBe(%);
    true |> (map |> isInternalModule(%, createFlamechartStackFrame('foo', 12, 35)) |> expect(%)).toBe(%);
    true |> (map |> isInternalModule(%, createFlamechartStackFrame('foo', 15, 100)) |> expect(%)).toBe(%);
    true |> (map |> isInternalModule(%, createFlamechartStackFrame('bar', 12, 0)) |> expect(%)).toBe(%);
    true |> (map |> isInternalModule(%, createFlamechartStackFrame('bar', 22, 125)) |> expect(%)).toBe(%);
  });
  'should properly identify stack frames outside of the provided module ranges' |> it(%, () => {
    false |> (map |> isInternalModule(%, createFlamechartStackFrame('foo', 9, 0)) |> expect(%)).toBe(%);
    false |> (map |> isInternalModule(%, createFlamechartStackFrame('foo', 15, 101)) |> expect(%)).toBe(%);
    false |> (map |> isInternalModule(%, createFlamechartStackFrame('bar', 17, 0)) |> expect(%)).toBe(%);
    false |> (map |> isInternalModule(%, createFlamechartStackFrame('baz', 12, 0)) |> expect(%)).toBe(%);
  });
});