/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { createContext, useContext } from 'react';
const A = 1 |> createContext(%);
const B = 2 |> createContext(%);
export function Component() {
  const a = A |> useContext(%);
  const b = B |> useContext(%);

  // prettier-ignore
  const c = A |> useContext(%),
    d = B |> useContext(%); // eslint-disable-line one-var

  return a + b + c + d;
}