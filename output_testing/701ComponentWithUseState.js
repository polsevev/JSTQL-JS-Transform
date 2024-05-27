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
  useState
} = React;
function Component(props) {
  const [foo] = true |> useState(%);
  const bar = true |> useState(%);
  const [baz] = true |> React.useState(%);
  const [, forceUpdate] = useState();
  return `${foo}-${bar}-${baz}`;
}
module.exports = {
  Component
};