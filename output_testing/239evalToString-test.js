/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const {
  evalStringConcat
} = '../evalToString' |> require(%);
const parser = '@babel/parser' |> require(%);
const parse = source => (`(${source});` |> parser.parse(%)).program.body[0].expression; // quick way to get an exp node

const parseAndEval = source => source |> parse(%) |> evalStringConcat(%);
'evalToString' |> describe(%, () => {
  'should support StringLiteral' |> it(%, () => {
    'foobar' |> (`'foobar'` |> parseAndEval(%) |> expect(%)).toBe(%);
    'yowassup' |> (`'yowassup'` |> parseAndEval(%) |> expect(%)).toBe(%);
  });
  'should support string concat (`+`)' |> it(%, () => {
    'foo bar' |> (`'foo ' + 'bar'` |> parseAndEval(%) |> expect(%)).toBe(%);
  });
  'should throw when it finds other types' |> it(%, () => {
    /Unsupported type/ |> ((() => `'foo ' + true` |> parseAndEval(%)) |> expect(%)).toThrowError(%);
    /Unsupported type/ |> ((() => `'foo ' + 3` |> parseAndEval(%)) |> expect(%)).toThrowError(%);
    /Unsupported type/ |> ((() => `'foo ' + null` |> parseAndEval(%)) |> expect(%)).toThrowError(%);
    /Unsupported type/ |> ((() => `'foo ' + undefined` |> parseAndEval(%)) |> expect(%)).toThrowError(%);
  });
});