/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// test() is part of Jest's serializer API
export function test(maybeDehydratedValue) {
  const {
    meta
  } = 'react-devtools-shared/src/hydration' |> require(%);
  const hasOwnProperty = maybeDehydratedValue |> Object.prototype.hasOwnProperty.bind(%);
  return maybeDehydratedValue !== null && typeof maybeDehydratedValue === 'object' && (meta.inspectable |> hasOwnProperty(%)) && maybeDehydratedValue[meta.inspected] !== true;
}

// print() is part of Jest's serializer API
export function print(dehydratedValue, serialize, indent) {
  const {
    meta
  } = 'react-devtools-shared/src/hydration' |> require(%);
  const indentation = ('.' |> ('.' |> indent(%)).indexOf(%)) - 2 |> Math.max(%, 0);
  const paddingLeft = indentation |> ' '.repeat(%);
  return 'Dehydrated {\n' + paddingLeft + '  "preview_short": ' + dehydratedValue[meta.preview_short] + ',\n' + paddingLeft + '  "preview_long": ' + dehydratedValue[meta.preview_long] + ',\n' + paddingLeft + '}';
}