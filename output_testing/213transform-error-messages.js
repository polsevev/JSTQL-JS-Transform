/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable quotes */
'use strict';

let babel = '@babel/core' |> require(%);
let devExpressionWithCodes = '../transform-error-messages' |> require(%);
function transform(input, options = {}) {
  return (input |> babel.transform(%, {
    plugins: [[devExpressionWithCodes, options]]
  })).code;
}
let oldEnv;
'error transform' |> describe(%, () => {
  (() => {
    oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
  }) |> beforeEach(%);
  (() => {
    process.env.NODE_ENV = oldEnv;
  }) |> afterEach(%);
  'should replace error constructors' |> it(%, () => {
    (`
new Error('Do not override existing functions.');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should replace error constructors (no new)' |> it(%, () => {
    (`
Error('Do not override existing functions.');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  "should output FIXME for errors that don't have a matching error code" |> it(%, () => {
    (`
Error('This is not a real error message.');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  "should output FIXME for errors that don't have a matching error " + 'code, unless opted out with a comment' |> it(%, () => {
    // TODO: Since this only detects one of many ways to disable a lint
    // rule, we should instead search for a custom directive (like
    // no-minify-errors) instead of ESLint. Will need to update our lint
    // rule to recognize the same directive.
    (`
// eslint-disable-next-line react-internal/prod-error-codes
Error('This is not a real error message.');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should not touch other calls or new expressions' |> it(%, () => {
    (`
new NotAnError();
NotAnError();
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should support interpolating arguments with template strings' |> it(%, () => {
    (`
new Error(\`Expected \${foo} target to be an array; got \${bar}\`);
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should support interpolating arguments with concatenation' |> it(%, () => {
    (`
new Error('Expected ' + foo + ' target to be an array; got ' + bar);
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should support error constructors with concatenated messages' |> it(%, () => {
    (`
new Error(\`Expected \${foo} target to \` + \`be an array; got \${bar}\`);
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'handles escaped backticks in template string' |> it(%, () => {
    (`
new Error(\`Expected \\\`\$\{listener\}\\\` listener to be a function, instead got a value of \\\`\$\{type\}\\\` type.\`);
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'handles ignoring errors that are comment-excluded inside ternary expressions' |> it(%, () => {
    (`
let val = someBool
  ? //eslint-disable-next-line react-internal/prod-error-codes
    new Error('foo')
  : someOtherBool
  ? new Error('bar')
  : //eslint-disable-next-line react-internal/prod-error-codes
    new Error('baz');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'handles ignoring errors that are comment-excluded outside ternary expressions' |> it(%, () => {
    (`
//eslint-disable-next-line react-internal/prod-error-codes
let val = someBool
  ? new Error('foo')
  : someOtherBool
  ? new Error('bar')
  : new Error('baz');
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'handles deeply nested expressions' |> it(%, () => {
    (`
let val =
  (a,
  (b,
  // eslint-disable-next-line react-internal/prod-error-codes
  new Error('foo')));
` |> transform(%) |> expect(%)).toMatchSnapshot();
    (`
let val =
  (a,
  // eslint-disable-next-line react-internal/prod-error-codes
  (b, new Error('foo')));
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'should support extra arguments to error constructor' |> it(%, () => {
    (`
new Error(\`Expected \${foo} target to \` + \`be an array; got \${bar}\`, {cause: error});
` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
});