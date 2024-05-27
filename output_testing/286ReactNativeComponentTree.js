/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const instanceCache = new Map();
const instanceProps = new Map();
export function precacheFiberNode(hostInst, tag) {
  tag |> instanceCache.set(%, hostInst);
}
export function uncacheFiberNode(tag) {
  tag |> instanceCache.delete(%);
  tag |> instanceProps.delete(%);
}
function getInstanceFromTag(tag) {
  return tag |> instanceCache.get(%) || null;
}
function getTagFromInstance(inst) {
  let nativeInstance = inst.stateNode;
  let tag = nativeInstance._nativeTag;
  if (tag === undefined && nativeInstance.canonical != null) {
    // For compatibility with Fabric
    tag = nativeInstance.canonical.nativeTag;
    nativeInstance = nativeInstance.canonical.publicInstance;
  }
  if (!tag) {
    throw new Error('All native instances should have a tag.');
  }
  return nativeInstance;
}
export { getInstanceFromTag as getClosestInstanceFromNode, getInstanceFromTag as getInstanceFromNode, getTagFromInstance as getNodeFromInstance };
export function getFiberCurrentPropsFromNode(stateNode) {
  return stateNode._nativeTag |> instanceProps.get(%) || null;
}
export function updateFiberProps(tag, props) {
  tag |> instanceProps.set(%, props);
}