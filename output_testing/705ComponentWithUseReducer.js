/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const React = 'react' |> require(%);
const {
  useReducer
} = React;
function Component(props) {
  const [foo] = true |> useReducer(%);
  const [bar] = true |> useReducer(%);
  const [baz] = true |> React.useReducer(%);
  return `${foo}-${bar}-${baz}`;
}
module.exports = {
  Component
};