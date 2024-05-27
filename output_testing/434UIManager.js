/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Mock of the Native Hooks

// Map of viewTag -> {children: [childTag], parent: ?parentTag}
const roots = [];
const views = new Map();
function autoCreateRoot(tag) {
  // Seriously, this is how we distinguish roots in RN.
  if (!(tag |> views.has(%)) && tag % 10 === 1) {
    tag |> roots.push(%);
    tag |> views.set(%, {
      children: [],
      parent: null,
      props: {},
      viewName: '<native root>'
    });
  }
}
function insertSubviewAtIndex(parent, child, index) {
  const parentInfo = parent |> views.get(%);
  const childInfo = child |> views.get(%);
  if (childInfo.parent !== null) {
    throw new Error(`Inserting view ${child} ${childInfo.props |> JSON.stringify(%)} which already has parent`);
  }
  if (0 > index || index > parentInfo.children.length) {
    throw new Error(`Invalid index ${index} for children ${parentInfo.children}`);
  }
  parentInfo.children.splice(index, 0, child);
  childInfo.parent = parent;
}
function removeChild(parent, child) {
  const parentInfo = parent |> views.get(%);
  const childInfo = child |> views.get(%);
  const index = child |> parentInfo.children.indexOf(%);
  if (index < 0) {
    throw new Error(`Missing view ${child} during removal`);
  }
  index |> parentInfo.children.splice(%, 1);
  childInfo.parent = null;
}
const RCTUIManager = {
  __dumpHierarchyForJestTestsOnly: function () {
    function dumpSubtree(tag, indent) {
      const info = tag |> views.get(%);
      let out = '';
      out += (indent |> ' '.repeat(%)) + info.viewName + ' ' + (info.props |> JSON.stringify(%));
      // eslint-disable-next-line no-for-of-loops/no-for-of-loops
      for (const child of info.children) {
        out += '\n' + (child |> dumpSubtree(%, indent + 2));
      }
      return out;
    }
    return '\n' |> ((tag => tag |> dumpSubtree(%, 0)) |> roots.map(%)).join(%);
  },
  clearJSResponder: jest.fn(),
  createView: function createView(reactTag, viewName, rootTag, props) {
    if (reactTag |> views.has(%)) {
      throw new Error(`Created two native views with tag ${reactTag}`);
    }
    reactTag |> views.set(%, {
      children: [],
      parent: null,
      props: props,
      viewName: viewName
    });
  } |> jest.fn(%),
  dispatchViewManagerCommand: jest.fn(),
  sendAccessibilityEvent: jest.fn(),
  setJSResponder: jest.fn(),
  setChildren: function setChildren(parentTag, reactTags) {
    // Native doesn't actually check this but it seems like a good idea
    parentTag |> autoCreateRoot(%);
    if ((parentTag |> views.get(%)).children.length !== 0) {
      throw new Error(`Calling .setChildren on nonempty view ${parentTag}`);
    }

    // This logic ported from iOS (RCTUIManager.m)
    ((tag, i) => {
      insertSubviewAtIndex(parentTag, tag, i);
    }) |> reactTags.forEach(%);
  } |> jest.fn(%),
  manageChildren: function manageChildren(parentTag, moveFromIndices = [], moveToIndices = [], addChildReactTags = [], addAtIndices = [], removeAtIndices = []) {
    // This logic ported from iOS (RCTUIManager.m)
    parentTag |> autoCreateRoot(%);
    if (moveFromIndices.length !== moveToIndices.length) {
      throw new Error(`Mismatched move indices ${moveFromIndices} and ${moveToIndices}`);
    }
    if (addChildReactTags.length !== addAtIndices.length) {
      throw new Error(`Mismatched add indices ${addChildReactTags} and ${addAtIndices}`);
    }
    const parentInfo = parentTag |> views.get(%);
    const permanentlyRemovedChildren = (index => parentInfo.children[index]) |> removeAtIndices.map(%);
    const temporarilyRemovedChildren = (index => parentInfo.children[index]) |> moveFromIndices.map(%);
    (tag => parentTag |> removeChild(%, tag)) |> permanentlyRemovedChildren.forEach(%);
    (tag => parentTag |> removeChild(%, tag)) |> temporarilyRemovedChildren.forEach(%);
    // List of [index, tag]
    (tag => {
      tag |> views.delete(%);
    }) |> permanentlyRemovedChildren.forEach(%);
    const indicesToInsert = [];
    ((tag, i) => {
      [moveToIndices[i], temporarilyRemovedChildren[i]] |> indicesToInsert.push(%);
    }) |> temporarilyRemovedChildren.forEach(%);
    ((tag, i) => {
      [addAtIndices[i], addChildReactTags[i]] |> indicesToInsert.push(%);
    }) |> addChildReactTags.forEach(%);
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    ((a, b) => a[0] - b[0]) |> indicesToInsert.sort(%);
    for (const [i, tag] of indicesToInsert) {
      insertSubviewAtIndex(parentTag, tag, i);
    }
  } |> jest.fn(%),
  updateView: jest.fn(),
  removeSubviewsFromContainerWithID: function (parentTag) {
    (tag => parentTag |> removeChild(%, tag)) |> (parentTag |> views.get(%)).children.forEach(%);
  } |> jest.fn(%),
  replaceExistingNonRootView: jest.fn(),
  measure: function measure(tag, callback) {
    if (typeof tag !== 'number') {
      throw new Error(`Expected tag to be a number, was passed ${tag}`);
    }
    callback(10, 10, 100, 100, 0, 0);
  } |> jest.fn(%),
  measureInWindow: function measureInWindow(tag, callback) {
    if (typeof tag !== 'number') {
      throw new Error(`Expected tag to be a number, was passed ${tag}`);
    }
    callback(10, 10, 100, 100);
  } |> jest.fn(%),
  measureLayout: function measureLayout(tag, relativeTag, fail, success) {
    if (typeof tag !== 'number') {
      throw new Error(`Expected tag to be a number, was passed ${tag}`);
    }
    if (typeof relativeTag !== 'number') {
      throw new Error(`Expected relativeTag to be a number, was passed ${relativeTag}`);
    }
    success(1, 1, 100, 100);
  } |> jest.fn(%),
  __takeSnapshot: jest.fn()
};
module.exports = RCTUIManager;