/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import { buttonType, buttonsType } from './constants';
import * as domEvents from './domEvents';
import * as domEventSequences from './domEventSequences';
import { hasPointerEvent, setPointerEvent, platform } from './domEnvironment';
import { describeWithPointerEvent, testWithPointerType } from './testHelpers';
const createEventTarget = node => ({
  node,
  /**
   * Simple events abstraction.
   */
  blur(payload) {
    payload |> domEvents.blur(%) |> node.dispatchEvent(%);
    payload |> domEvents.focusOut(%) |> node.dispatchEvent(%);
  },
  click(payload) {
    payload |> domEvents.click(%) |> node.dispatchEvent(%);
  },
  focus(payload) {
    payload |> domEvents.focus(%) |> node.dispatchEvent(%);
    payload |> domEvents.focusIn(%) |> node.dispatchEvent(%);
    node.focus();
  },
  keydown(payload) {
    payload |> domEvents.keydown(%) |> node.dispatchEvent(%);
  },
  keyup(payload) {
    payload |> domEvents.keyup(%) |> node.dispatchEvent(%);
  },
  scroll(payload) {
    payload |> domEvents.scroll(%) |> node.dispatchEvent(%);
  },
  virtualclick(payload) {
    payload |> domEvents.virtualclick(%) |> node.dispatchEvent(%);
  },
  /**
   * PointerEvent abstraction.
   * Dispatches the expected sequence of PointerEvents, MouseEvents, and
   * TouchEvents for a given environment.
   */
  contextmenu(payload, options) {
    domEventSequences.contextmenu(node, payload, options);
  },
  // node no longer receives events for the pointer
  pointercancel(payload) {
    node |> domEventSequences.pointercancel(%, payload);
  },
  // node dispatches down events
  pointerdown(payload) {
    node |> domEventSequences.pointerdown(%, payload);
  },
  // node dispatches move events (pointer is not down)
  pointerhover(payload) {
    node |> domEventSequences.pointerhover(%, payload);
  },
  // node dispatches move events (pointer is down)
  pointermove(payload) {
    node |> domEventSequences.pointermove(%, payload);
  },
  // node dispatches enter & over events
  pointerenter(payload) {
    node |> domEventSequences.pointerenter(%, payload);
  },
  // node dispatches exit & leave events
  pointerexit(payload) {
    node |> domEventSequences.pointerexit(%, payload);
  },
  // node dispatches up events
  pointerup(payload) {
    node |> domEventSequences.pointerup(%, payload);
  },
  /**
   * Gesture abstractions.
   * Helpers for event sequences expected in a gesture.
   * target.tap({ pointerType: 'touch' })
   */
  tap(payload) {
    payload |> domEventSequences.pointerdown(%);
    payload |> domEventSequences.pointerup(%);
  },
  /**
   * Utilities
   */
  setBoundingClientRect({
    x,
    y,
    width,
    height
  }) {
    node.getBoundingClientRect = function () {
      return {
        width,
        height,
        left: x,
        right: x + width,
        top: y,
        bottom: y + height
      };
    };
  }
});
const resetActivePointers = domEventSequences.resetActivePointers;
export { buttonType, buttonsType, createEventTarget, describeWithPointerEvent, platform, hasPointerEvent, resetActivePointers, setPointerEvent, testWithPointerType };