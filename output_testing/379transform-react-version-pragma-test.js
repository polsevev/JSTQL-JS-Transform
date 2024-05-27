/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const semver = 'semver' |> require(%);
let shouldPass;
let isFocused;
'transform-react-version-pragma' |> describe(%, () => {
  const originalTest = test;

  // eslint-disable-next-line no-unused-vars
  const _test_react_version = (range, testName, cb) => {
    testName |> originalTest(%, (...args) => {
      shouldPass = !!('18.0.0' |> semver.satisfies(%, range));
      return cb(...args);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _test_react_version_focus = (range, testName, cb) => {
    testName |> originalTest(%, (...args) => {
      shouldPass = !!('18.0.0' |> semver.satisfies(%, range));
      isFocused = true;
      return cb(...args);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _test_ignore_for_react_version = (testName, cb) => {
    testName |> originalTest(%, (...args) => {
      shouldPass = false;
      return cb(...args);
    });
  };
  // @reactVersion >= 17.9
  (() => {
    shouldPass = null;
    isFocused = false;
  }) |> beforeEach(%);
  // @reactVersion >= 18.1
  'reactVersion flag is on >=' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  'reactVersion flag is off >=' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion <= 17.9
  'reactVersion flag is on <=' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion > 17.9
  'reactVersion flag is off <=' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion > 18.1
  'reactVersion flag is on >' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion < 18.1
  'reactVersion flag is off >' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion < 17.0.0
  'reactVersion flag is on <' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion = 18.0
  'reactVersion flag is off <' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion = 18.1
  'reactVersion flag is on =' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  /* eslint-disable jest/no-focused-tests */

  // @reactVersion >= 18.1
  'reactVersion flag is off =' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  'reactVersion fit' |> fit(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
    true |> (isFocused |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  // @reactVersion <= 17.1
  'reactVersion test.only' |> test.only(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
    true |> (isFocused |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  // @reactVersion >= 17.1
  'reactVersion multiple pragmas fail' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
    false |> (isFocused |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  // @reactVersion <= 17.1
  'reactVersion multiple pragmas pass' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
    false |> (isFocused |> expect(%)).toBe(%);
  });
  // @reactVersion <= 18.1
  // @reactVersion >= 17.1
  'reactVersion focused multiple pragmas fail' |> test.only(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
    true |> (isFocused |> expect(%)).toBe(%);
  });
  'reactVersion focused multiple pragmas pass' |> test.only(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
    true |> (isFocused |> expect(%)).toBe(%);
  });
});