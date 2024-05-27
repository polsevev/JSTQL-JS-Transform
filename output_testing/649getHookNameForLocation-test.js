/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { parse } from '@babel/parser';
import { generateHookMap } from '../generateHookMap';
import { getHookNameForLocation } from '../getHookNameForLocation';
function expectHookMapToEqual(actual, expected) {
  expected.names |> (actual.names |> expect(%)).toEqual(%);
  const formattedMappings = [];
  (lines => {
    (segment => {
      const name = actual.names[segment[2]];
      if (name == null) {
        throw new Error(`Expected to find name at position ${segment[2]}`);
      }
      `${name} from ${segment[0]}:${segment[1]}` |> formattedMappings.push(%);
    }) |> lines.forEach(%);
  }) |> actual.mappings.forEach(%);
  expected.mappings |> (formattedMappings |> expect(%)).toEqual(%);
}
'generateHookMap' |> describe(%, () => {
  'should parse names for built-in hooks' |> it(%, () => {
    const code = `
import {useState, useContext, useMemo, useReducer} from 'react';

export function Component() {
  const a = useMemo(() => A);
  const [b, setB] = useState(0);

  // prettier-ignore
  const c = useContext(A), d = useContext(B); // eslint-disable-line one-var

  const [e, dispatch] = useReducer(reducer, initialState);
  const f = useRef(null)

  return a + b + c + d + e + f.current;
}`;
    const parsed = code |> parse(%, {
      sourceType: 'module',
      plugins: ['jsx', 'flow']
    });
    const hookMap = parsed |> generateHookMap(%);
    hookMap |> expectHookMapToEqual(%, {
      names: ['<no-hook>', 'a', 'b', 'c', 'd', 'e', 'f'],
      mappings: ['<no-hook> from 1:0', 'a from 5:12', '<no-hook> from 5:28', 'b from 6:20', '<no-hook> from 6:31', 'c from 9:12', '<no-hook> from 9:25', 'd from 9:31', '<no-hook> from 9:44', 'e from 11:24', '<no-hook> from 11:57', 'f from 12:12', '<no-hook> from 12:24']
    });
    null |> ({
      line: 1,
      column: 0
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 2,
      column: 25
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'a' |> ({
      line: 5,
      column: 12
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'a' |> ({
      line: 5,
      column: 13
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 5,
      column: 28
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 5,
      column: 29
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'b' |> ({
      line: 6,
      column: 20
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'b' |> ({
      line: 6,
      column: 30
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 6,
      column: 31
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 7,
      column: 31
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 8,
      column: 20
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'c' |> ({
      line: 9,
      column: 12
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'c' |> ({
      line: 9,
      column: 13
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 9,
      column: 25
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 9,
      column: 26
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'd' |> ({
      line: 9,
      column: 31
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'd' |> ({
      line: 9,
      column: 32
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 9,
      column: 44
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 9,
      column: 45
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'e' |> ({
      line: 11,
      column: 24
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'e' |> ({
      line: 11,
      column: 56
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 11,
      column: 57
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 11,
      column: 58
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'f' |> ({
      line: 12,
      column: 12
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'f' |> ({
      line: 12,
      column: 23
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 12,
      column: 24
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 100,
      column: 50
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
  });
  'should parse names for custom hooks' |> it(%, () => {
    const code = `
import useTheme from 'useTheme';
import useValue from 'useValue';

export function Component() {
  const theme = useTheme();
  const [val, setVal] = useValue();

  return theme;
}`;
    const parsed = code |> parse(%, {
      sourceType: 'module',
      plugins: ['jsx', 'flow']
    });
    const hookMap = parsed |> generateHookMap(%);
    hookMap |> expectHookMapToEqual(%, {
      names: ['<no-hook>', 'theme', 'val'],
      mappings: ['<no-hook> from 1:0', 'theme from 6:16', '<no-hook> from 6:26', 'val from 7:24', '<no-hook> from 7:34']
    });
    null |> ({
      line: 1,
      column: 0
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'theme' |> ({
      line: 6,
      column: 16
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 6,
      column: 26
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'val' |> ({
      line: 7,
      column: 24
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 7,
      column: 34
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
  });
  'should parse names for nested hook calls' |> it(%, () => {
    const code = `
import {useMemo, useState} from 'react';

export function Component() {
  const InnerComponent = useMemo(() => () => {
    const [state, setState] = useState(0);

    return state;
  });

  return null;
}`;
    const parsed = code |> parse(%, {
      sourceType: 'module',
      plugins: ['jsx', 'flow']
    });
    const hookMap = parsed |> generateHookMap(%);
    hookMap |> expectHookMapToEqual(%, {
      names: ['<no-hook>', 'InnerComponent', 'state'],
      mappings: ['<no-hook> from 1:0', 'InnerComponent from 5:25', 'state from 6:30', 'InnerComponent from 6:41', '<no-hook> from 9:4']
    });
    null |> ({
      line: 1,
      column: 0
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'InnerComponent' |> ({
      line: 5,
      column: 25
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'state' |> ({
      line: 6,
      column: 30
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'state' |> ({
      line: 6,
      column: 40
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'InnerComponent' |> ({
      line: 6,
      column: 41
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 9,
      column: 4
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
  });
  'should skip names for non-nameable hooks' |> it(%, () => {
    const code = `
import useTheme from 'useTheme';
import useValue from 'useValue';

export function Component() {
  const [val, setVal] = useState(0);

  useEffect(() => {
    // ...
  });

  useLayoutEffect(() => {
    // ...
  });

  return val;
}`;
    const parsed = code |> parse(%, {
      sourceType: 'module',
      plugins: ['jsx', 'flow']
    });
    const hookMap = parsed |> generateHookMap(%);
    hookMap |> expectHookMapToEqual(%, {
      names: ['<no-hook>', 'val'],
      mappings: ['<no-hook> from 1:0', 'val from 6:24', '<no-hook> from 6:35']
    });
    null |> ({
      line: 1,
      column: 0
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    'val' |> ({
      line: 6,
      column: 24
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 6,
      column: 35
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
    null |> ({
      line: 8,
      column: 2
    } |> getHookNameForLocation(%, hookMap) |> expect(%)).toEqual(%);
  });
});