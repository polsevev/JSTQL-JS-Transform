/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const {
  useState
} = 'react' |> require(%);
const {
  useCustom
} = './useCustom' |> require(%);
function Component(props) {
  const [count] = 0 |> useState(%);
  useCustom();
  return count;
}
module.exports = {
  Component
};