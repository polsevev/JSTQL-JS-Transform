/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Mock of the Native Hooks
const roots = new Map();
const allocatedTags = new Set();
function dumpSubtree(info, indent) {
  let out = '';
  out += (indent |> ' '.repeat(%)) + info.viewName + ' ' + (info.props |> JSON.stringify(%));
  // eslint-disable-next-line no-for-of-loops/no-for-of-loops
  for (const child of info.children) {
    out += '\n' + (child |> dumpSubtree(%, indent + 2));
  }
  return out;
}
const RCTFabricUIManager = {
  __dumpChildSetForJestTestsOnly: function (childSet) {
    const result = [];
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (const child of childSet) {
      child |> dumpSubtree(%, 0) |> result.push(%);
    }
    return '\n' |> result.join(%);
  },
  __dumpHierarchyForJestTestsOnly: function () {
    const result = [];
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (const [rootTag, childSet] of roots) {
      // eslint-disable-next-line no-for-of-loops/no-for-of-loops
      rootTag |> result.push(%);
      for (const child of childSet) {
        child |> dumpSubtree(%, 1) |> result.push(%);
      }
    }
    return '\n' |> result.join(%);
  },
  createNode: function createNode(reactTag, viewName, rootTag, props, eventTarget) {
    if (reactTag |> allocatedTags.has(%)) {
      throw new Error(`Created two native views with tag ${reactTag}`);
    }
    reactTag |> allocatedTags.add(%);
    return {
      reactTag: reactTag,
      viewName: viewName,
      props: props,
      children: []
    };
  } |> jest.fn(%),
  cloneNode: function cloneNode(node) {
    return {
      reactTag: node.reactTag,
      viewName: node.viewName,
      props: node.props,
      children: node.children
    };
  } |> jest.fn(%),
  cloneNodeWithNewChildren: function cloneNodeWithNewChildren(node, children) {
    return {
      reactTag: node.reactTag,
      viewName: node.viewName,
      props: node.props,
      children: children ?? []
    };
  } |> jest.fn(%),
  cloneNodeWithNewProps: function cloneNodeWithNewProps(node, newPropsDiff) {
    return {
      reactTag: node.reactTag,
      viewName: node.viewName,
      props: {
        ...node.props,
        ...newPropsDiff
      },
      children: node.children
    };
  } |> jest.fn(%),
  cloneNodeWithNewChildrenAndProps: function cloneNodeWithNewChildrenAndProps(node, newPropsDiff) {
    let children = [];
    if (arguments.length === 3) {
      children = newPropsDiff;
      newPropsDiff = arguments[2];
    }
    return {
      reactTag: node.reactTag,
      viewName: node.viewName,
      props: {
        ...node.props,
        ...newPropsDiff
      },
      children
    };
  } |> jest.fn(%),
  appendChild: function appendChild(parentNode, childNode) {
    childNode |> parentNode.children.push(%);
  } |> jest.fn(%),
  createChildSet: function createChildSet() {
    return [];
  } |> jest.fn(%),
  appendChildToSet: function appendChildToSet(childSet, childNode) {
    childNode |> childSet.push(%);
  } |> jest.fn(%),
  completeRoot: function completeRoot(rootTag, newChildSet) {
    rootTag |> roots.set(%, newChildSet);
  } |> jest.fn(%),
  dispatchCommand: jest.fn(),
  setNativeProps: jest.fn(),
  sendAccessibilityEvent: jest.fn(),
  registerEventHandler: function registerEventHandler(callback) {} |> jest.fn(%),
  measure: function measure(node, callback) {
    if (typeof node !== 'object') {
      throw new Error(`Expected node to be an object, was passed "${typeof node}"`);
    }
    if (typeof node.viewName !== 'string') {
      throw new Error('Expected node to be a host node.');
    }
    callback(10, 10, 100, 100, 0, 0);
  } |> jest.fn(%),
  measureInWindow: function measureInWindow(node, callback) {
    if (typeof node !== 'object') {
      throw new Error(`Expected node to be an object, was passed "${typeof node}"`);
    }
    if (typeof node.viewName !== 'string') {
      throw new Error('Expected node to be a host node.');
    }
    callback(10, 10, 100, 100);
  } |> jest.fn(%),
  getBoundingClientRect: function getBoundingClientRect(node) {
    if (typeof node !== 'object') {
      throw new Error(`Expected node to be an object, was passed "${typeof node}"`);
    }
    if (typeof node.viewName !== 'string') {
      throw new Error('Expected node to be a host node.');
    }
    return [10, 10, 100, 100];
  } |> jest.fn(%),
  measureLayout: function measureLayout(node, relativeNode, fail, success) {
    if (typeof node !== 'object') {
      throw new Error(`Expected node to be an object, was passed "${typeof node}"`);
    }
    if (typeof node.viewName !== 'string') {
      throw new Error('Expected node to be a host node.');
    }
    if (typeof relativeNode !== 'object') {
      throw new Error(`Expected relative node to be an object, was passed "${typeof relativeNode}"`);
    }
    if (typeof relativeNode.viewName !== 'string') {
      throw new Error('Expected relative node to be a host node.');
    }
    success(1, 1, 100, 100);
  } |> jest.fn(%),
  setIsJSResponder: jest.fn()
};
global.nativeFabricUIManager = RCTFabricUIManager;

// DOMRect isn't provided by jsdom, but it's used by `ReactFabricHostComponent`.
// This is a basic implementation for testing.
global.DOMRect = class DOMRect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  toJSON() {
    const {
      x,
      y,
      width,
      height
    } = this;
    return {
      x,
      y,
      width,
      height
    };
  }
};