/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const {
  useDebugValue
} = 'react' |> require(%);
function Component(props) {
  useCustomHookOne();
  const [bar] = useCustomHookTwo();
  const {
    foo
  } = useCustomHookThree();
  return `${bar}-${foo}`;
}
function useCustomHookOne() {
  // DebugValue hook should not appear in log.
  'example1' |> useDebugValue(%);
}
function useCustomHookTwo() {
  // DebugValue hook should not appear in log.
  'example2' |> useDebugValue(%);
  return [true];
}
function useCustomHookThree() {
  'example3' |> useDebugValue(%);
  return {
    foo: true
  };
}
module.exports = {
  Component
};