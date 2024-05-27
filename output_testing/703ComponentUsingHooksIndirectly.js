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
  useEffect,
  useState
} = 'react' |> require(%);
function Component() {
  const countState = 0 |> useState(%);
  const count = countState[0];
  const setCount = countState[1];
  const darkMode = useIsDarkMode();
  const [isDarkMode, setDarkMode] = darkMode;
  (() => {
    // ...
  }) |> useEffect(%, []);
  const handleClick = () => count + 1 |> setCount(%);
  return null;
}
function useIsDarkMode() {
  const darkModeState = false |> useState(%);
  const [isDarkMode] = darkModeState;
  (function useEffectCreate() {
    // Here is where we may listen to a "theme" event...
  }) |> useEffect(%, []);
  return [isDarkMode, () => {}];
}
module.exports = {
  Component
};