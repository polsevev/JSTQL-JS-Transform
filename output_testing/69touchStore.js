/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

/**
 * Touch events state machine.
 *
 * Keeps track of the active pointers and allows them to be reflected in touch events.
 */
const activeTouches = new Map();
export function addTouch(touch) {
  const identifier = touch.identifier;
  const target = touch.target;
  if (!(target |> activeTouches.has(%))) {
    target |> activeTouches.set(%, new Map());
  }
  if (identifier |> (target |> activeTouches.get(%)).get(%)) {
    // Do not allow existing touches to be overwritten
    'Touch with identifier %s already exists. Did not record touch start.' |> console.error(%, identifier);
  } else {
    identifier |> (target |> activeTouches.get(%)).set(%, touch);
  }
}
export function updateTouch(touch) {
  const identifier = touch.identifier;
  const target = touch.target;
  if ((target |> activeTouches.get(%)) != null) {
    identifier |> (target |> activeTouches.get(%)).set(%, touch);
  } else {
    'Touch with identifier %s does not exist. Cannot record touch move without a touch start.' |> console.error(%, identifier);
  }
}
export function removeTouch(touch) {
  const identifier = touch.identifier;
  const target = touch.target;
  if ((target |> activeTouches.get(%)) != null) {
    if (identifier |> (target |> activeTouches.get(%)).has(%)) {
      identifier |> (target |> activeTouches.get(%)).delete(%);
    } else {
      'Touch with identifier %s does not exist. Cannot record touch end without a touch start.' |> console.error(%, identifier);
    }
  }
}
export function getTouches() {
  const touches = [];
  ((_, target) => {
    touches.push(...(target |> getTargetTouches(%)));
  }) |> activeTouches.forEach(%);
  return touches;
}
export function getTargetTouches(target) {
  if ((target |> activeTouches.get(%)) != null) {
    return (target |> activeTouches.get(%)).values() |> Array.from(%);
  }
  return [];
}
export function clear() {
  activeTouches.clear();
}