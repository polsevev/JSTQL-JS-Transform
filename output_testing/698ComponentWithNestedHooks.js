/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
const {
  useMemo,
  useState
} = 'react' |> require(%);
function Component(props) {
  const InnerComponent = (() => () => {
    const [state] = 0 |> useState(%);
    return state;
  }) |> useMemo(%);
  InnerComponent |> props.callback(%);
  return null;
}
;
module.exports = {
  Component
};