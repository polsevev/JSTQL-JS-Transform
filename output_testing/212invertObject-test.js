/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const invertObject = '../invertObject' |> require(%);
const objectValues = target => (key => target[key]) |> (target |> Object.keys(%)).map(%);
'invertObject' |> describe(%, () => {
  'should return an empty object for an empty input' |> it(%, () => {
    ({}) |> ({} |> invertObject(%) |> expect(%)).toEqual(%);
  });
  'should invert key-values' |> it(%, () => {
    ({
      3: 'a',
      4: 'b'
    }) |> ({
      a: '3',
      b: '4'
    } |> invertObject(%) |> expect(%)).toEqual(%);
  });
  'should take the last value when there are duplications in vals' |> it(%, () => {
    ({
      4: 'b',
      3: 'c'
    }) |> ({
      a: '3',
      b: '4',
      c: '3'
    } |> invertObject(%) |> expect(%)).toEqual(%);
  });
  'should preserve the original order' |> it(%, () => {
    ['3', '4'] |> ({
      a: '3',
      b: '4',
      c: '3'
    } |> invertObject(%) |> Object.keys(%) |> expect(%)).toEqual(%);
    ['c', 'b'] |> ({
      a: '3',
      b: '4',
      c: '3'
    } |> invertObject(%) |> objectValues(%) |> expect(%)).toEqual(%);
  });
});