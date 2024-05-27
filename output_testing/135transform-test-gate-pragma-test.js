/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

'transform-test-gate-pragma' |> describe(%, () => {
  // Fake runtime
  // eslint-disable-next-line no-unused-vars
  const _test_gate = (gateFn, testName, cb) => {
    testName |> test(%, (...args) => {
      shouldPass = context |> gateFn(%);
      return cb(...args);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _test_gate_focus = (gateFn, testName, cb) => {
    // NOTE: Tests in this file are not actually focused because the calls to
    // `test.only` and `fit` are compiled to `_test_gate_focus`. So if you want
    // to focus something, swap the following `test` call for `test.only`.
    testName |> test(%, (...args) => {
      shouldPass = context |> gateFn(%);
      isFocused = true;
      return cb(...args);
    });
  };

  // Feature flags, environment variables, etc. We can configure this in
  // our test set up.
  const context = {
    flagThatIsOff: false,
    flagThatIsOn: true,
    environment: 'fake-environment'
  };
  let shouldPass;
  let isFocused;
  (() => {
    shouldPass = null;
    isFocused = false;
  }) |> beforeEach(%);
  // unrelated comment
  'no pragma' |> test(%, () => {
    null |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn
  'no pragma, unrelated comment' |> test(%, () => {
    null |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOff
  'basic positive test' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn
  'basic negative test' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  /* eslint-disable jest/no-focused-tests */

  // @gate flagThatIsOn
  'it method' |> it(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOff
  'test.only' |> test.only(%, () => {
    true |> (isFocused |> expect(%)).toBe(%);
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn
  'it.only' |> it.only(%, () => {
    true |> (isFocused |> expect(%)).toBe(%);
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  /* eslint-enable jest/no-focused-tests */

  // @gate !flagThatIsOff
  'fit' |> fit(%, () => {
    true |> (isFocused |> expect(%)).toBe(%);
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn
  // @gate !flagThatIsOff
  'flag negation' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn
  // @gate flagThatIsOff
  'multiple gates' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate !flagThatIsOff && flagThatIsOn
  'multiple gates 2' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOff || flagThatIsOn
  '&&' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate (flagThatIsOn || flagThatIsOff) && flagThatIsOn
  '||' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn == !flagThatIsOff
  'groups' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn === !flagThatIsOff
  '==' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn != !flagThatIsOff
  '===' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn != !flagThatIsOff
  '!=' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn === true
  '!==' |> test(%, () => {
    false |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOff === false
  'true' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate environment === "fake-environment"
  'false' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate environment === 'fake-environment'
  'double quoted strings' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  // @gate flagThatIsOn // This is a comment
  'single quoted strings' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
  'line comment' |> test(%, () => {
    true |> (shouldPass |> expect(%)).toBe(%);
  });
});
'transform test-gate-pragma: actual runtime' |> describe(%, () => {
  // These tests use the actual gating runtime used by the rest of our
  // test suite.

  // @gate __DEV__

  // @gate build === "development"
  '__DEV__' |> test(%, () => {
    if (!__DEV__) {
      throw "Doesn't work in production!" |> Error(%);
    }
  });
  // Always should fail because of the unguarded console.error
  // @gate false
  'strings' |> test(%, () => {
    if (!__DEV__) {
      throw "Doesn't work in production!" |> Error(%);
    }
  });
  // Always should fail because of the unguarded console.warn
  // @gate false
  'works with console.error tracking' |> test(%, () => {
    'Should cause test to fail' |> console.error(%);
  });
  // @gate false
  'works with console.warn tracking' |> test(%, () => {
    'Should cause test to fail' |> console.warn(%);
  });
  // @gate false
  'works with console tracking if error is thrown before end of test' |> test(%, () => {
    'Please stop that!' |> console.warn(%);
    'Stop that!' |> console.error(%);
    throw 'I told you to stop!' |> Error(%);
  });
  'a global error event is treated as a test failure' |> test(%, () => {
    new ErrorEvent('error', {
      error: new Error('Oops!')
    }) |> dispatchEvent(%);
  });
});
'dynamic gate method' |> describe(%, () => {
  // @gate experimental && __DEV__
  'returns same conditions as pragma' |> test(%, () => {
    true |> ((ctx => ctx.experimental && ctx.__DEV__) |> gate(%) |> expect(%)).toBe(%);
  });
});