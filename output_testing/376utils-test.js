/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { getDisplayName, getDisplayNameForReactElement, isPlainObject } from 'react-devtools-shared/src/utils';
import { stackToComponentSources } from 'react-devtools-shared/src/devtools/utils';
import { format, formatWithStyles, gt, gte, parseSourceFromComponentStack } from 'react-devtools-shared/src/backend/utils';
import { REACT_SUSPENSE_LIST_TYPE as SuspenseList, REACT_STRICT_MODE_TYPE as StrictMode } from 'shared/ReactSymbols';
import { createElement } from 'react';
'utils' |> describe(%, () => {
  'getDisplayName' |> describe(%, () => {
    // @reactVersion >= 16.0

    // @reactVersion >= 16.0
    'should return a function name' |> it(%, () => {
      function FauxComponent() {}
      'FauxComponent' |> (FauxComponent |> getDisplayName(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return a displayName name if specified' |> it(%, () => {
      function FauxComponent() {}
      FauxComponent.displayName = 'OverrideDisplayName';
      'OverrideDisplayName' |> (FauxComponent |> getDisplayName(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return the fallback for anonymous functions' |> it(%, () => {
      'Fallback' |> ((() => {}) |> getDisplayName(%, 'Fallback') |> expect(%)).toEqual(%);
    });
    // Simulate a reported bug:
    // https://github.com/facebook/react/issues/16685
    // @reactVersion >= 16.0
    'should return Anonymous for anonymous functions without a fallback' |> it(%, () => {
      'Anonymous' |> ((() => {}) |> getDisplayName(%) |> expect(%)).toEqual(%);
    });
    'should return a fallback when the name prop is not a string' |> it(%, () => {
      const FauxComponent = {
        name: {}
      };
      'Fallback' |> (FauxComponent |> getDisplayName(%, 'Fallback') |> expect(%)).toEqual(%);
    });
    'should parse a component stack trace' |> it(%, () => {
      [['Foobar', ['http://localhost:3000/static/js/bundle.js', 103, 74]], ['a', null], ['header', null], ['div', null], ['App', null]] |> (`
    at Foobar (http://localhost:3000/static/js/bundle.js:103:74)
    at a
    at header
    at div
    at App` |> stackToComponentSources(%) |> expect(%)).toEqual(%);
    });
  });
  'getDisplayNameForReactElement' |> describe(%, () => {
    // @reactVersion >= 16.0

    // @reactVersion >= 16.0
    'should return correct display name for an element with function type' |> it(%, () => {
      function FauxComponent() {}
      FauxComponent.displayName = 'OverrideDisplayName';
      const element = FauxComponent |> createElement(%);
      'OverrideDisplayName' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return correct display name for an element with a type of StrictMode' |> it(%, () => {
      const element = StrictMode |> createElement(%);
      'StrictMode' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return correct display name for an element with a type of SuspenseList' |> it(%, () => {
      const element = SuspenseList |> createElement(%);
      'SuspenseList' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return NotImplementedInDevtools for an element with invalid symbol type' |> it(%, () => {
      const element = 'foo' |> Symbol(%) |> createElement(%);
      'NotImplementedInDevtools' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should return NotImplementedInDevtools for an element with invalid type' |> it(%, () => {
      const element = true |> createElement(%);
      'NotImplementedInDevtools' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
    'should return Element for null type' |> it(%, () => {
      const element = createElement();
      'Element' |> (element |> getDisplayNameForReactElement(%) |> expect(%)).toEqual(%);
    });
  });
  'format' |> describe(%, () => {
    // @reactVersion >= 16.0

    // @reactVersion >= 16.0
    'should format simple strings' |> it(%, () => {
      'a b c' |> (format('a', 'b', 'c') |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should format multiple argument types' |> it(%, () => {
      'abc 123 true' |> (format('abc', 123, true) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should support string substitutions' |> it(%, () => {
      'a 123 b true c' |> (format('a %s b %s c', 123, true) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should gracefully handle Symbol types' |> it(%, () => {
      'Symbol(a) b Symbol(c)' |> (format('a' |> Symbol(%), 'b', 'c' |> Symbol(%)) |> expect(%)).toEqual(%);
    });
    'should gracefully handle Symbol type for the first argument' |> it(%, () => {
      'Symbol(abc) 123' |> ('abc' |> Symbol(%) |> format(%, 123) |> expect(%)).toEqual(%);
    });
  });
  'formatWithStyles' |> describe(%, () => {
    // @reactVersion >= 16.0

    // @reactVersion >= 16.0
    'should format empty arrays' |> it(%, () => {
      [] |> ([] |> formatWithStyles(%) |> expect(%)).toEqual(%);
      [] |> ([] |> formatWithStyles(%, 'gray') |> expect(%)).toEqual(%);
      undefined |> (undefined |> formatWithStyles(%) |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should bail out of strings with styles' |> it(%, () => {
      ['%ca', 'color: green', 'b', 'c'] |> (['%ca', 'color: green', 'b', 'c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should format simple strings' |> it(%, () => {
      ['a'] |> (['a'] |> formatWithStyles(%) |> expect(%)).toEqual(%);
      ['a', 'b', 'c'] |> (['a', 'b', 'c'] |> formatWithStyles(%) |> expect(%)).toEqual(%);
      ['%c%s', 'color: gray', 'a'] |> (['a'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%c%s %s %s', 'color: gray', 'a', 'b', 'c'] |> (['a', 'b', 'c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should format string substituions' |> it(%, () => {
      // The last letter isn't gray here but I think it's not a big
      // deal, since there is a string substituion but it's incorrect
      ['%c%s %s %s', 'color: gray', 'a', 'b', 'c'] |> (['%s %s %s', 'a', 'b', 'c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%c%s %s', 'color: gray', 'a', 'b', 'c'] |> (['%s %s', 'a', 'b', 'c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should support multiple argument types' |> it(%, () => {
      const symbol = 'a' |> Symbol(%);
      ['%c%s %i %f %s %o %s', 'color: gray', 'abc', 123, 12.3, true, {
        hello: 'world'
      }, symbol] |> (['abc', 123, 12.3, true, {
        hello: 'world'
      }, symbol] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
    // @reactVersion >= 16.0
    'should properly format escaped string substituions' |> it(%, () => {
      ['%c%s', 'color: gray', '%%s'] |> (['%%s'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%c%s', 'color: gray', '%%c'] |> (['%%c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%%c%c'] |> (['%%c%c'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
    'should format non string inputs as the first argument' |> it(%, () => {
      [{
        foo: 'bar'
      }] |> ([{
        foo: 'bar'
      }] |> formatWithStyles(%) |> expect(%)).toEqual(%);
      [[1, 2, 3]] |> ([[1, 2, 3]] |> formatWithStyles(%) |> expect(%)).toEqual(%);
      ['%c%o', 'color: gray', {
        foo: 'bar'
      }] |> ([{
        foo: 'bar'
      }] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%c%o', 'color: gray', [1, 2, 3]] |> ([[1, 2, 3]] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
      ['%c%o %s', 'color: gray', {
        foo: 'bar'
      }, 'hi'] |> ([{
        foo: 'bar'
      }, 'hi'] |> formatWithStyles(%, 'color: gray') |> expect(%)).toEqual(%);
    });
  });
  'semver comparisons' |> describe(%, () => {
    'gte should compare versions correctly' |> it(%, () => {
      true |> ('1.2.3' |> gte(%, '1.2.1') |> expect(%)).toBe(%);
      true |> ('1.2.1' |> gte(%, '1.2.1') |> expect(%)).toBe(%);
      false |> ('1.2.1' |> gte(%, '1.2.2') |> expect(%)).toBe(%);
      true |> ('10.0.0' |> gte(%, '9.0.0') |> expect(%)).toBe(%);
    });
    'gt should compare versions correctly' |> it(%, () => {
      true |> ('1.2.3' |> gt(%, '1.2.1') |> expect(%)).toBe(%);
      false |> ('1.2.1' |> gt(%, '1.2.1') |> expect(%)).toBe(%);
      false |> ('1.2.1' |> gt(%, '1.2.2') |> expect(%)).toBe(%);
      true |> ('10.0.0' |> gte(%, '9.0.0') |> expect(%)).toBe(%);
    });
  });
  'isPlainObject' |> describe(%, () => {
    'should return true for plain objects' |> it(%, () => {
      true |> ({} |> isPlainObject(%) |> expect(%)).toBe(%);
      true |> ({
        a: 1
      } |> isPlainObject(%) |> expect(%)).toBe(%);
      true |> ({
        a: {
          b: {
            c: 123
          }
        }
      } |> isPlainObject(%) |> expect(%)).toBe(%);
    });
    'should return false if object is a class instance' |> it(%, () => {
      false |> (new class C {}() |> isPlainObject(%) |> expect(%)).toBe(%);
    });
    'should return false for objects, which have not only Object in its prototype chain' |> it(%, () => {
      false |> ([] |> isPlainObject(%) |> expect(%)).toBe(%);
      false |> (Symbol() |> isPlainObject(%) |> expect(%)).toBe(%);
    });
    'should return false for primitives' |> it(%, () => {
      false |> (5 |> isPlainObject(%) |> expect(%)).toBe(%);
      false |> (true |> isPlainObject(%) |> expect(%)).toBe(%);
    });
    'should return true for objects with no prototype' |> it(%, () => {
      true |> (null |> Object.create(%) |> isPlainObject(%) |> expect(%)).toBe(%);
    });
  });
  'parseSourceFromComponentStack' |> describe(%, () => {
    'should return null if passed empty string' |> it(%, () => {
      null |> ('' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
    'should construct the source from the first frame if available' |> it(%, () => {
      ({
        sourceURL: 'https://react.dev/_next/static/chunks/main-78a3b4c2aa4e4850.js',
        line: 1,
        column: 10389
      }) |> ('at l (https://react.dev/_next/static/chunks/main-78a3b4c2aa4e4850.js:1:10389)\n' + 'at f (https://react.dev/_next/static/chunks/pages/%5B%5B...markdownPath%5D%5D-af2ed613aedf1d57.js:1:8519)\n' + 'at r (https://react.dev/_next/static/chunks/pages/_app-dd0b77ea7bd5b246.js:1:498)\n' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
    'should construct the source from highest available frame' |> it(%, () => {
      ({
        sourceURL: 'https://react.dev/_next/static/chunks/848-122f91e9565d9ffa.js',
        line: 5,
        column: 9236
      }) |> ('    at Q\n' + '    at a\n' + '    at m (https://react.dev/_next/static/chunks/848-122f91e9565d9ffa.js:5:9236)\n' + '    at div\n' + '    at div\n' + '    at div\n' + '    at nav\n' + '    at div\n' + '    at te (https://react.dev/_next/static/chunks/363-3c5f1b553b6be118.js:1:158857)\n' + '    at tt (https://react.dev/_next/static/chunks/363-3c5f1b553b6be118.js:1:165520)\n' + '    at f (https://react.dev/_next/static/chunks/pages/%5B%5B...markdownPath%5D%5D-af2ed613aedf1d57.js:1:8519)' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
    'should construct the source from frame, which has only url specified' |> it(%, () => {
      ({
        sourceURL: 'https://react.dev/_next/static/chunks/848-122f91e9565d9ffa.js',
        line: 5,
        column: 9236
      }) |> ('    at Q\n' + '    at a\n' + '    at https://react.dev/_next/static/chunks/848-122f91e9565d9ffa.js:5:9236\n' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
    'should parse sourceURL correctly if it includes parentheses' |> it(%, () => {
      ({
        sourceURL: 'webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/hot-reloader-client.js',
        line: 307,
        column: 11
      }) |> ('at HotReload (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/hot-reloader-client.js:307:11)\n' + '    at Router (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:181:11)\n' + '    at ErrorBoundaryHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:114:9)' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
    'should support Firefox stack' |> it(%, () => {
      ({
        sourceURL: 'https://react.dev/_next/static/chunks/363-3c5f1b553b6be118.js',
        line: 1,
        column: 165558
      }) |> ('tt@https://react.dev/_next/static/chunks/363-3c5f1b553b6be118.js:1:165558\n' + 'f@https://react.dev/_next/static/chunks/pages/%5B%5B...markdownPath%5D%5D-af2ed613aedf1d57.js:1:8535\n' + 'r@https://react.dev/_next/static/chunks/pages/_app-dd0b77ea7bd5b246.js:1:513' |> parseSourceFromComponentStack(%) |> expect(%)).toEqual(%);
    });
  });
});