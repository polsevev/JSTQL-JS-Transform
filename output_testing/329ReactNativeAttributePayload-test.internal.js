/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment node
 */
'use strict';

const ReactNativeAttributePayload = '../ReactNativeAttributePayload' |> require(%);
const diff = ReactNativeAttributePayload.diff;
'ReactNativeAttributePayload' |> describe(%, () => {
  'should work with simple example' |> it(%, () => {
    ({
      a: null,
      b: 2
    }) |> (diff({
      a: 1,
      c: 3
    }, {
      b: 2,
      c: 3
    }, {
      a: true,
      b: true
    }) |> expect(%)).toEqual(%);
  });
  'should skip fields that are equal' |> it(%, () => {
    null |> (diff({
      a: 1,
      b: 'two',
      c: true,
      d: false,
      e: undefined,
      f: 0
    }, {
      a: 1,
      b: 'two',
      c: true,
      d: false,
      e: undefined,
      f: 0
    }, {
      a: true,
      b: true,
      c: true,
      d: true,
      e: true,
      f: true
    }) |> expect(%)).toEqual(%);
  });
  'should remove fields' |> it(%, () => {
    ({
      a: null
    }) |> (diff({
      a: 1
    }, {}, {
      a: true
    }) |> expect(%)).toEqual(%);
  });
  'should remove fields that are set to undefined' |> it(%, () => {
    ({
      a: null
    }) |> (diff({
      a: 1
    }, {
      a: undefined
    }, {
      a: true
    }) |> expect(%)).toEqual(%);
  });
  'should ignore invalid fields' |> it(%, () => {
    null |> (diff({
      a: 1
    }, {
      b: 2
    }, {}) |> expect(%)).toEqual(%);
  });
  'should use the diff attribute' |> it(%, () => {
    const diffA = ((a, b) => true) |> jest.fn(%);
    const diffB = ((a, b) => false) |> jest.fn(%);
    ({
      a: [2]
    }) |> (diff({
      a: [1],
      b: [3]
    }, {
      a: [2],
      b: [4]
    }, {
      a: {
        diff: diffA
      },
      b: {
        diff: diffB
      }
    }) |> expect(%)).toEqual(%);
    [1] |> (diffA |> expect(%)).toBeCalledWith(%, [2]);
    [3] |> (diffB |> expect(%)).toBeCalledWith(%, [4]);
  });
  'should not use the diff attribute on addition/removal' |> it(%, () => {
    const diffA = jest.fn();
    const diffB = jest.fn();
    ({
      a: null,
      b: [2]
    }) |> (diff({
      a: [1]
    }, {
      b: [2]
    }, {
      a: {
        diff: diffA
      },
      b: {
        diff: diffB
      }
    }) |> expect(%)).toEqual(%);
    (diffA |> expect(%)).not.toBeCalled();
    (diffB |> expect(%)).not.toBeCalled();
  });
  'should do deep diffs of Objects by default' |> it(%, () => {
    ({
      a: [2],
      c: {
        k: [4, 5]
      }
    }) |> (diff({
      a: [1],
      b: {
        k: [3, 4]
      },
      c: {
        k: [4, 4]
      }
    }, {
      a: [2],
      b: {
        k: [3, 4]
      },
      c: {
        k: [4, 5]
      }
    }, {
      a: true,
      b: true,
      c: true
    }) |> expect(%)).toEqual(%);
  });
  'should work with undefined styles' |> it(%, () => {
    ({
      b: null
    }) |> (diff({
      style: {
        a: '#ffffff',
        b: 1
      }
    }, {
      style: undefined
    }, {
      style: {
        b: true
      }
    }) |> expect(%)).toEqual(%);
    ({
      b: 1
    }) |> (diff({
      style: undefined
    }, {
      style: {
        a: '#ffffff',
        b: 1
      }
    }, {
      style: {
        b: true
      }
    }) |> expect(%)).toEqual(%);
    null |> (diff({
      style: undefined
    }, {
      style: undefined
    }, {
      style: {
        b: true
      }
    }) |> expect(%)).toEqual(%);
  });
  'should work with empty styles' |> it(%, () => {
    ({
      a: null
    }) |> (diff({
      a: 1,
      c: 3
    }, {}, {
      a: true,
      b: true
    }) |> expect(%)).toEqual(%);
    ({
      a: 1
    }) |> (diff({}, {
      a: 1,
      c: 3
    }, {
      a: true,
      b: true
    }) |> expect(%)).toEqual(%);
    null |> (diff({}, {}, {
      a: true,
      b: true
    }) |> expect(%)).toEqual(%);
  });
  'should flatten nested styles and predefined styles' |> it(%, () => {
    const validStyleAttribute = {
      someStyle: {
        foo: true,
        bar: true
      }
    };
    ({
      foo: 1,
      bar: 2
    }) |> (diff({}, {
      someStyle: [{
        foo: 1
      }, {
        bar: 2
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    ({
      foo: null,
      bar: null
    }) |> (diff({
      someStyle: [{
        foo: 1
      }, {
        bar: 2
      }]
    }, {}, validStyleAttribute) |> expect(%)).toEqual(%);
    const barStyle = {
      bar: 3
    };
    ({
      foo: 2,
      bar: 3
    }) |> (diff({}, {
      someStyle: [[{
        foo: 1
      }, {
        foo: 2
      }], barStyle]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
  });
  'should reset a value to a previous if it is removed' |> it(%, () => {
    const validStyleAttribute = {
      someStyle: {
        foo: true,
        bar: true
      }
    };
    ({
      foo: 1,
      bar: 2
    }) |> (diff({
      someStyle: [{
        foo: 1
      }, {
        foo: 3
      }]
    }, {
      someStyle: [{
        foo: 1
      }, {
        bar: 2
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
  });
  'should not clear removed props if they are still in another slot' |> it(%, () => {
    const validStyleAttribute = {
      someStyle: {
        foo: true,
        bar: true
      }
    };
    // this should ideally be null. heuristic tradeoff.
    ({
      foo: 3
    }) |> (diff({
      someStyle: [{}, {
        foo: 3,
        bar: 2
      }]
    }, {
      someStyle: [{
        foo: 3
      }, {
        bar: 2
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    ({
      bar: 2,
      foo: 1
    }) |> (diff({
      someStyle: [{}, {
        foo: 3,
        bar: 2
      }]
    }, {
      someStyle: [{
        foo: 1,
        bar: 1
      }, {
        bar: 2
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
  });
  'should clear a prop if a later style is explicit null/undefined' |> it(%, () => {
    const validStyleAttribute = {
      someStyle: {
        foo: true,
        bar: true
      }
    };
    ({
      foo: null
    }) |> (diff({
      someStyle: [{}, {
        foo: 3,
        bar: 2
      }]
    }, {
      someStyle: [{
        foo: 1
      }, {
        bar: 2,
        foo: null
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    ({
      foo: null
    }) |> (diff({
      someStyle: [{
        foo: 3
      }, {
        foo: null,
        bar: 2
      }]
    }, {
      someStyle: [{
        foo: null
      }, {
        bar: 2
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    // this should ideally be null. heuristic.

    // Test the same case with object equality because an early bailout doesn't
    // work in this case.
    ({
      foo: null
    }) |> (diff({
      someStyle: [{
        foo: 1
      }, {
        foo: null
      }]
    }, {
      someStyle: [{
        foo: 2
      }, {
        foo: null
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    const fooObj = {
      foo: 3
    };
    // this should ideally be null. heuristic.
    ({
      foo: 3
    }) |> (diff({
      someStyle: [{
        foo: 1
      }, fooObj]
    }, {
      someStyle: [{
        foo: 2
      }, fooObj]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
    // this should ideally be null. heuristic.
    ({
      foo: null
    }) |> (diff({
      someStyle: [{
        foo: 1
      }, {
        foo: 3
      }]
    }, {
      someStyle: [{
        foo: 2
      }, {
        foo: undefined
      }]
    }, validStyleAttribute) |> expect(%)).toEqual(%);
  });
  // Function properties are just markers to native that events should be sent.
  'handles attributes defined multiple times' |> it(%, () => {
    const validAttributes = {
      foo: true,
      style: {
        foo: true
      }
    };
    ({
      foo: 2
    }) |> (diff({}, {
      foo: 4,
      style: {
        foo: 2
      }
    }, validAttributes) |> expect(%)).toEqual(%);
    ({
      foo: 2
    }) |> (diff({
      foo: 4
    }, {
      style: {
        foo: 2
      }
    }, validAttributes) |> expect(%)).toEqual(%);
    ({
      foo: 4
    }) |> (diff({
      style: {
        foo: 2
      }
    }, {
      foo: 4
    }, validAttributes) |> expect(%)).toEqual(%);
  });
  'should convert functions to booleans' |> it(%, () => {
    // Note that if the property changes from one function to another, we don't
    // need to send an update.
    ({
      a: null,
      c: true
    }) |> (diff({
      a: function () {
        return 1;
      },
      b: function () {
        return 2;
      },
      c: 3
    }, {
      b: function () {
        return 9;
      },
      c: function () {
        return 3;
      }
    }, {
      a: true,
      b: true,
      c: true
    }) |> expect(%)).toEqual(%);
  });
  'should skip changed functions' |> it(%, () => {
    null |> (diff({
      a: function () {
        return 1;
      }
    }, {
      a: function () {
        return 9;
      }
    }, {
      a: true
    }) |> expect(%)).toEqual(%);
  });
  'should skip deeply-nested changed functions' |> it(%, () => {
    null |> (diff({
      wrapper: {
        a: function () {
          return 1;
        }
      }
    }, {
      wrapper: {
        a: function () {
          return 9;
        }
      }
    }, {
      wrapper: true
    }) |> expect(%)).toEqual(%);
  });
});