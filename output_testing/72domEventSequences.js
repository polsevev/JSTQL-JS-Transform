/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import { buttonType, buttonsType, defaultPointerId, defaultPointerSize, defaultBrowserChromeSize } from './constants';
import * as domEvents from './domEvents';
import { hasPointerEvent, platform } from './domEnvironment';
import * as touchStore from './touchStore';

/**
 * Converts a PointerEvent payload to a Touch
 */
function createTouch(target, payload) {
  const {
    height = defaultPointerSize,
    pageX,
    pageY,
    pointerId,
    pressure = 1,
    twist = 0,
    width = defaultPointerSize,
    x = 0,
    y = 0
  } = payload;
  return {
    clientX: x,
    clientY: y,
    force: pressure,
    identifier: pointerId,
    pageX: pageX || x,
    pageY: pageY || y,
    radiusX: width / 2,
    radiusY: height / 2,
    rotationAngle: twist,
    target,
    screenX: x,
    screenY: y + defaultBrowserChromeSize
  };
}

/**
 * Converts a PointerEvent to a TouchEvent
 */
function createTouchEventPayload(target, touch, payload) {
  const {
    altKey = false,
    ctrlKey = false,
    metaKey = false,
    preventDefault,
    shiftKey = false,
    timeStamp
  } = payload;
  return {
    altKey,
    changedTouches: [touch],
    ctrlKey,
    metaKey,
    preventDefault,
    shiftKey,
    targetTouches: target |> touchStore.getTargetTouches(%),
    timeStamp,
    touches: touchStore.getTouches()
  };
}
function getPointerType(payload) {
  let pointerType = 'mouse';
  if (payload != null && payload.pointerType != null) {
    pointerType = payload.pointerType;
  }
  return pointerType;
}

/**
 * Pointer events sequences.
 *
 * Creates representative browser event sequences for high-level gestures based on pointers.
 * This allows unit tests to be written in terms of simple pointer interactions while testing
 * that the responses to those interactions account for the complex sequence of events that
 * browsers produce as a result.
 *
 * Every time a new pointer touches the surface a 'touchstart' event should be dispatched.
 * - 'changedTouches' contains the new touch.
 * - 'targetTouches' contains all the active pointers for the target.
 * - 'touches' contains all the active pointers on the surface.
 *
 * Every time an existing pointer moves a 'touchmove' event should be dispatched.
 * - 'changedTouches' contains the updated touch.
 *
 * Every time an existing pointer leaves the surface a 'touchend' event should be dispatched.
 * - 'changedTouches' contains the released touch.
 * - 'targetTouches' contains any of the remaining active pointers for the target.
 */

export function contextmenu(target, defaultPayload, {
  pointerType = 'mouse',
  modified
} = {}) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const payload = {
    pointerId: defaultPointerId,
    pointerType,
    ...defaultPayload
  };
  const preventDefault = payload.preventDefault;
  if (pointerType === 'touch') {
    if (hasPointerEvent()) {
      ({
        ...payload,
        button: buttonType.primary,
        buttons: buttonsType.primary
      }) |> domEvents.pointerdown(%) |> dispatch(%);
    }
    const touch = target |> createTouch(%, payload);
    touch |> touchStore.addTouch(%);
    const touchEventPayload = createTouchEventPayload(target, touch, payload);
    touchEventPayload |> domEvents.touchstart(%) |> dispatch(%);
    ({
      button: buttonType.primary,
      buttons: buttonsType.none,
      preventDefault
    }) |> domEvents.contextmenu(%) |> dispatch(%);
    touch |> touchStore.removeTouch(%);
  } else if (pointerType === 'mouse') {
    if (modified === true) {
      const button = buttonType.primary;
      const buttons = buttonsType.primary;
      const ctrlKey = true;
      if (hasPointerEvent()) {
        ({
          button,
          buttons,
          ctrlKey,
          pointerType
        }) |> domEvents.pointerdown(%) |> dispatch(%);
      }
      ({
        button,
        buttons,
        ctrlKey
      }) |> domEvents.mousedown(%) |> dispatch(%);
      if (platform.get() === 'mac') {
        ({
          button,
          buttons,
          ctrlKey,
          preventDefault
        }) |> domEvents.contextmenu(%) |> dispatch(%);
      }
    } else {
      const button = buttonType.secondary;
      const buttons = buttonsType.secondary;
      if (hasPointerEvent()) {
        ({
          button,
          buttons,
          pointerType
        }) |> domEvents.pointerdown(%) |> dispatch(%);
      }
      ({
        button,
        buttons
      }) |> domEvents.mousedown(%) |> dispatch(%);
      ({
        button,
        buttons,
        preventDefault
      }) |> domEvents.contextmenu(%) |> dispatch(%);
    }
  }
}
export function pointercancel(target, defaultPayload) {
  const dispatchEvent = arg => arg |> target.dispatchEvent(%);
  const pointerType = defaultPayload |> getPointerType(%);
  const payload = {
    pointerId: defaultPointerId,
    pointerType,
    ...defaultPayload
  };
  if (hasPointerEvent()) {
    payload |> domEvents.pointercancel(%) |> dispatchEvent(%);
  } else {
    if (pointerType === 'mouse') {
      payload |> domEvents.dragstart(%) |> dispatchEvent(%);
    } else {
      const touch = target |> createTouch(%, payload);
      touch |> touchStore.removeTouch(%);
      const touchEventPayload = createTouchEventPayload(target, touch, payload);
      touchEventPayload |> domEvents.touchcancel(%) |> dispatchEvent(%);
    }
  }
}
export function pointerdown(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const pointerType = defaultPayload |> getPointerType(%);
  const payload = {
    button: buttonType.primary,
    buttons: buttonsType.primary,
    pointerId: defaultPointerId,
    pointerType,
    ...defaultPayload
  };
  if (pointerType === 'mouse') {
    if (hasPointerEvent()) {
      payload |> domEvents.pointerover(%) |> dispatch(%);
      payload |> domEvents.pointerenter(%) |> dispatch(%);
    }
    payload |> domEvents.mouseover(%) |> dispatch(%);
    payload |> domEvents.mouseenter(%) |> dispatch(%);
    if (hasPointerEvent()) {
      payload |> domEvents.pointerdown(%) |> dispatch(%);
    }
    payload |> domEvents.mousedown(%) |> dispatch(%);
    if (document.activeElement !== target) {
      domEvents.focus() |> dispatch(%);
    }
  } else {
    if (hasPointerEvent()) {
      payload |> domEvents.pointerover(%) |> dispatch(%);
      payload |> domEvents.pointerenter(%) |> dispatch(%);
      payload |> domEvents.pointerdown(%) |> dispatch(%);
    }
    const touch = target |> createTouch(%, payload);
    touch |> touchStore.addTouch(%);
    const touchEventPayload = createTouchEventPayload(target, touch, payload);
    touchEventPayload |> domEvents.touchstart(%) |> dispatch(%);
    if (hasPointerEvent()) {
      payload |> domEvents.gotpointercapture(%) |> dispatch(%);
    }
  }
}
export function pointerenter(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const payload = {
    pointerId: defaultPointerId,
    ...defaultPayload
  };
  if (hasPointerEvent()) {
    payload |> domEvents.pointerover(%) |> dispatch(%);
    payload |> domEvents.pointerenter(%) |> dispatch(%);
  }
  payload |> domEvents.mouseover(%) |> dispatch(%);
  payload |> domEvents.mouseenter(%) |> dispatch(%);
}
export function pointerexit(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const payload = {
    pointerId: defaultPointerId,
    ...defaultPayload
  };
  if (hasPointerEvent()) {
    payload |> domEvents.pointerout(%) |> dispatch(%);
    payload |> domEvents.pointerleave(%) |> dispatch(%);
  }
  payload |> domEvents.mouseout(%) |> dispatch(%);
  payload |> domEvents.mouseleave(%) |> dispatch(%);
}
export function pointerhover(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const payload = {
    pointerId: defaultPointerId,
    ...defaultPayload
  };
  if (hasPointerEvent()) {
    payload |> domEvents.pointermove(%) |> dispatch(%);
  }
  payload |> domEvents.mousemove(%) |> dispatch(%);
}
export function pointermove(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const pointerType = defaultPayload |> getPointerType(%);
  const payload = {
    pointerId: defaultPointerId,
    pointerType,
    ...defaultPayload
  };
  if (hasPointerEvent()) {
    ({
      pressure: pointerType === 'touch' ? 1 : 0.5,
      ...payload
    }) |> domEvents.pointermove(%) |> dispatch(%);
  } else {
    if (pointerType === 'mouse') {
      payload |> domEvents.mousemove(%) |> dispatch(%);
    } else {
      const touch = target |> createTouch(%, payload);
      touch |> touchStore.updateTouch(%);
      const touchEventPayload = createTouchEventPayload(target, touch, payload);
      touchEventPayload |> domEvents.touchmove(%) |> dispatch(%);
    }
  }
}
export function pointerup(target, defaultPayload) {
  const dispatch = arg => arg |> target.dispatchEvent(%);
  const pointerType = defaultPayload |> getPointerType(%);
  const payload = {
    pointerId: defaultPointerId,
    pointerType,
    ...defaultPayload
  };
  if (pointerType === 'mouse') {
    if (hasPointerEvent()) {
      payload |> domEvents.pointerup(%) |> dispatch(%);
    }
    payload |> domEvents.mouseup(%) |> dispatch(%);
    payload |> domEvents.click(%) |> dispatch(%);
  } else {
    if (hasPointerEvent()) {
      payload |> domEvents.pointerup(%) |> dispatch(%);
      payload |> domEvents.lostpointercapture(%) |> dispatch(%);
      payload |> domEvents.pointerout(%) |> dispatch(%);
      payload |> domEvents.pointerleave(%) |> dispatch(%);
    }
    const touch = target |> createTouch(%, payload);
    touch |> touchStore.removeTouch(%);
    const touchEventPayload = createTouchEventPayload(target, touch, payload);
    touchEventPayload |> domEvents.touchend(%) |> dispatch(%);
    payload |> domEvents.mouseover(%) |> dispatch(%);
    payload |> domEvents.mousemove(%) |> dispatch(%);
    payload |> domEvents.mousedown(%) |> dispatch(%);
    if (document.activeElement !== target) {
      domEvents.focus() |> dispatch(%);
    }
    payload |> domEvents.mouseup(%) |> dispatch(%);
    payload |> domEvents.click(%) |> dispatch(%);
  }
}

/**
 * This function should be called after each test to ensure the touchStore is cleared
 * in cases where the mock pointers weren't released before the test completed
 * (e.g., a test failed or ran a partial gesture).
 */
export function resetActivePointers() {
  touchStore.clear();
}