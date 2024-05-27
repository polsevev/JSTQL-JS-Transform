/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import { defaultBrowserChromeSize } from '../constants';
import { createEventTarget, describeWithPointerEvent, testWithPointerType, resetActivePointers } from '../index';

/**
 * Unit test helpers
 */
/**
 * createEventTarget
 */
'describeWithPointerEvent' |> describeWithPointerEvent(%, pointerEvent => {
  'provides boolean to tests' |> test(%, () => {
    (pointerEvent |> expect(%)).toMatchSnapshot();
  });
  'testWithPointerType' |> testWithPointerType(%, pointerType => {
    (pointerType |> expect(%)).toMatchSnapshot();
  });
});
'createEventTarget' |> describe(%, () => {
  let node;
  (() => {
    node = 'div' |> document.createElement(%);
  }) |> beforeEach(%);
  (() => {
    node = null;
    resetActivePointers();
  }) |> afterEach(%);
  /**
   * Simple events
   */
  'returns expected API' |> test(%, () => {
    const target = node |> createEventTarget(%);
    node |> (target.node |> expect(%)).toEqual(%);
    `
      [
        "node",
        "blur",
        "click",
        "focus",
        "keydown",
        "keyup",
        "scroll",
        "virtualclick",
        "contextmenu",
        "pointercancel",
        "pointerdown",
        "pointerhover",
        "pointermove",
        "pointerenter",
        "pointerexit",
        "pointerup",
        "tap",
        "setBoundingClientRect",
      ]
    ` |> (target |> Object.keys(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  '.blur()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'blur' |> node.addEventListener(%, e => {
        `null` |> (e.relatedTarget |> expect(%)).toMatchInlineSnapshot(%);
      });
      target.blur();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'blur' |> node.addEventListener(%, e => {
        `null` |> (e.relatedTarget |> expect(%)).toMatchInlineSnapshot(%);
      });
      target.blur();
    });
  });
  '.click()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'click' |> node.addEventListener(%, e => {
        false |> (e.altKey |> expect(%)).toEqual(%);
        0 |> (e.button |> expect(%)).toEqual(%);
        0 |> (e.buttons |> expect(%)).toEqual(%);
        0 |> (e.clientX |> expect(%)).toEqual(%);
        0 |> (e.clientY |> expect(%)).toEqual(%);
        false |> (e.ctrlKey |> expect(%)).toEqual(%);
        1 |> (e.detail |> expect(%)).toEqual(%);
        'function' |> (typeof e.getModifierState |> expect(%)).toEqual(%);
        false |> (e.metaKey |> expect(%)).toEqual(%);
        0 |> (e.movementX |> expect(%)).toEqual(%);
        0 |> (e.movementY |> expect(%)).toEqual(%);
        0 |> (e.offsetX |> expect(%)).toEqual(%);
        0 |> (e.offsetY |> expect(%)).toEqual(%);
        0 |> (e.pageX |> expect(%)).toEqual(%);
        0 |> (e.pageY |> expect(%)).toEqual(%);
        'function' |> (typeof e.preventDefault |> expect(%)).toEqual(%);
        0 |> (e.screenX |> expect(%)).toEqual(%);
        defaultBrowserChromeSize |> (e.screenY |> expect(%)).toEqual(%);
        false |> (e.shiftKey |> expect(%)).toEqual(%);
        'number' |> (typeof e.timeStamp |> expect(%)).toEqual(%);
      });
      target.click();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'click' |> node.addEventListener(%, e => {
        true |> (e.altKey |> expect(%)).toEqual(%);
        1 |> (e.button |> expect(%)).toEqual(%);
        4 |> (e.buttons |> expect(%)).toEqual(%);
        10 |> (e.clientX |> expect(%)).toEqual(%);
        20 |> (e.clientY |> expect(%)).toEqual(%);
        true |> (e.ctrlKey |> expect(%)).toEqual(%);
        true |> (e.metaKey |> expect(%)).toEqual(%);
        1 |> (e.movementX |> expect(%)).toEqual(%);
        2 |> (e.movementY |> expect(%)).toEqual(%);
        5 |> (e.offsetX |> expect(%)).toEqual(%);
        5 |> (e.offsetY |> expect(%)).toEqual(%);
        50 |> (e.pageX |> expect(%)).toEqual(%);
        50 |> (e.pageY |> expect(%)).toEqual(%);
        10 |> (e.screenX |> expect(%)).toEqual(%);
        20 + defaultBrowserChromeSize |> (e.screenY |> expect(%)).toEqual(%);
        true |> (e.shiftKey |> expect(%)).toEqual(%);
      });
      ({
        altKey: true,
        button: 1,
        buttons: 4,
        x: 10,
        y: 20,
        ctrlKey: true,
        metaKey: true,
        movementX: 1,
        movementY: 2,
        offsetX: 5,
        offsetY: 5,
        pageX: 50,
        pageY: 50,
        shiftKey: true
      }) |> target.click(%);
    });
  });
  '.focus()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'focus' |> node.addEventListener(%, e => {
        `null` |> (e.relatedTarget |> expect(%)).toMatchInlineSnapshot(%);
      });
      target.blur();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'focus' |> node.addEventListener(%, e => {
        `null` |> (e.relatedTarget |> expect(%)).toMatchInlineSnapshot(%);
      });
      target.blur();
    });
  });
  '.keydown()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'keydown' |> node.addEventListener(%, e => {
        false |> (e.altKey |> expect(%)).toEqual(%);
        false |> (e.ctrlKey |> expect(%)).toEqual(%);
        'function' |> (typeof e.getModifierState |> expect(%)).toEqual(%);
        '' |> (e.key |> expect(%)).toEqual(%);
        false |> (e.metaKey |> expect(%)).toEqual(%);
        'function' |> (typeof e.preventDefault |> expect(%)).toEqual(%);
        false |> (e.shiftKey |> expect(%)).toEqual(%);
        'number' |> (typeof e.timeStamp |> expect(%)).toEqual(%);
      });
      target.keydown();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'keydown' |> node.addEventListener(%, e => {
        true |> (e.altKey |> expect(%)).toEqual(%);
        true |> (e.ctrlKey |> expect(%)).toEqual(%);
        true |> (e.isComposing |> expect(%)).toEqual(%);
        'Enter' |> (e.key |> expect(%)).toEqual(%);
        true |> (e.metaKey |> expect(%)).toEqual(%);
        true |> (e.shiftKey |> expect(%)).toEqual(%);
      });
      ({
        altKey: true,
        ctrlKey: true,
        isComposing: true,
        key: 'Enter',
        metaKey: true,
        shiftKey: true
      }) |> target.keydown(%);
    });
  });
  '.keyup()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'keyup' |> node.addEventListener(%, e => {
        false |> (e.altKey |> expect(%)).toEqual(%);
        false |> (e.ctrlKey |> expect(%)).toEqual(%);
        'function' |> (typeof e.getModifierState |> expect(%)).toEqual(%);
        '' |> (e.key |> expect(%)).toEqual(%);
        false |> (e.metaKey |> expect(%)).toEqual(%);
        'function' |> (typeof e.preventDefault |> expect(%)).toEqual(%);
        false |> (e.shiftKey |> expect(%)).toEqual(%);
        'number' |> (typeof e.timeStamp |> expect(%)).toEqual(%);
      });
      target.keydown();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'keyup' |> node.addEventListener(%, e => {
        true |> (e.altKey |> expect(%)).toEqual(%);
        true |> (e.ctrlKey |> expect(%)).toEqual(%);
        true |> (e.isComposing |> expect(%)).toEqual(%);
        'Enter' |> (e.key |> expect(%)).toEqual(%);
        true |> (e.metaKey |> expect(%)).toEqual(%);
        true |> (e.shiftKey |> expect(%)).toEqual(%);
      });
      ({
        altKey: true,
        ctrlKey: true,
        isComposing: true,
        key: 'Enter',
        metaKey: true,
        shiftKey: true
      }) |> target.keyup(%);
    });
  });
  '.scroll()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'scroll' |> node.addEventListener(%, e => {
        'scroll' |> (e.type |> expect(%)).toEqual(%);
      });
      target.scroll();
    });
  });
  /**
   * Complex event sequences
   *
   * ...coming soon
   */

  /**
   * Other APIs
   */
  '.virtualclick()' |> describe(%, () => {
    'default' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'click' |> node.addEventListener(%, e => {
        false |> (e.altKey |> expect(%)).toEqual(%);
        0 |> (e.button |> expect(%)).toEqual(%);
        0 |> (e.buttons |> expect(%)).toEqual(%);
        0 |> (e.clientX |> expect(%)).toEqual(%);
        0 |> (e.clientY |> expect(%)).toEqual(%);
        false |> (e.ctrlKey |> expect(%)).toEqual(%);
        0 |> (e.detail |> expect(%)).toEqual(%);
        'function' |> (typeof e.getModifierState |> expect(%)).toEqual(%);
        false |> (e.metaKey |> expect(%)).toEqual(%);
        0 |> (e.movementX |> expect(%)).toEqual(%);
        0 |> (e.movementY |> expect(%)).toEqual(%);
        0 |> (e.offsetX |> expect(%)).toEqual(%);
        0 |> (e.offsetY |> expect(%)).toEqual(%);
        0 |> (e.pageX |> expect(%)).toEqual(%);
        0 |> (e.pageY |> expect(%)).toEqual(%);
        'function' |> (typeof e.preventDefault |> expect(%)).toEqual(%);
        0 |> (e.screenX |> expect(%)).toEqual(%);
        0 |> (e.screenY |> expect(%)).toEqual(%);
        false |> (e.shiftKey |> expect(%)).toEqual(%);
        'number' |> (typeof e.timeStamp |> expect(%)).toEqual(%);
      });
      target.virtualclick();
    });
    'custom payload' |> test(%, () => {
      const target = node |> createEventTarget(%);
      'click' |> node.addEventListener(%, e => {
        // expect most of the custom payload to be ignored
        true |> (e.altKey |> expect(%)).toEqual(%);
        1 |> (e.button |> expect(%)).toEqual(%);
        0 |> (e.buttons |> expect(%)).toEqual(%);
        0 |> (e.clientX |> expect(%)).toEqual(%);
        0 |> (e.clientY |> expect(%)).toEqual(%);
        true |> (e.ctrlKey |> expect(%)).toEqual(%);
        0 |> (e.detail |> expect(%)).toEqual(%);
        true |> (e.metaKey |> expect(%)).toEqual(%);
        0 |> (e.pageX |> expect(%)).toEqual(%);
        0 |> (e.pageY |> expect(%)).toEqual(%);
        0 |> (e.screenX |> expect(%)).toEqual(%);
        0 |> (e.screenY |> expect(%)).toEqual(%);
        true |> (e.shiftKey |> expect(%)).toEqual(%);
      });
      ({
        altKey: true,
        button: 1,
        buttons: 4,
        x: 10,
        y: 20,
        ctrlKey: true,
        metaKey: true,
        pageX: 50,
        pageY: 50,
        shiftKey: true
      }) |> target.virtualclick(%);
    });
  });
  '.setBoundingClientRect()' |> test(%, () => {
    const target = node |> createEventTarget(%);
    `
      {
        "bottom": 0,
        "height": 0,
        "left": 0,
        "right": 0,
        "top": 0,
        "width": 0,
        "x": 0,
        "y": 0,
      }
    ` |> (node.getBoundingClientRect() |> expect(%)).toMatchInlineSnapshot(%);
    ({
      x: 10,
      y: 20,
      width: 100,
      height: 200
    }) |> target.setBoundingClientRect(%);
    `
      {
        "bottom": 220,
        "height": 200,
        "left": 10,
        "right": 110,
        "top": 20,
        "width": 100,
      }
    ` |> (node.getBoundingClientRect() |> expect(%)).toMatchInlineSnapshot(%);
  });
});