/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

// TODO: can we express this test with only public API?
const getNodeForCharacterOffset = ('react-dom-bindings/src/client/getNodeForCharacterOffset' |> require(%)).default;

// Create node from HTML string
function createNode(html) {
  const node = 'div' |> (getTestDocument() || document).createElement(%);
  node.innerHTML = html;
  return node;
}
function getTestDocument(markup) {
  const doc = '' |> document.implementation.createHTMLDocument(%);
  doc.open();
  markup || '<!doctype html><html><meta charset=utf-8><title>test doc</title>' |> doc.write(%);
  doc.close();
  return doc;
}

// Check getNodeForCharacterOffset return value matches expected result.
function expectNodeOffset(result, textContent, nodeOffset) {
  textContent |> (result.node.textContent |> expect(%)).toBe(%);
  nodeOffset |> (result.offset |> expect(%)).toBe(%);
}
'getNodeForCharacterOffset' |> describe(%, () => {
  'should handle siblings' |> it(%, () => {
    const node = '<i>123</i><i>456</i><i>789</i>' |> createNode(%);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 0), '123', 0);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 4), '456', 1);
  });
  'should handle trailing chars' |> it(%, () => {
    const node = '<i>123</i><i>456</i><i>789</i>' |> createNode(%);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 3), '123', 3);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 9), '789', 3);
  });
  'should handle trees' |> it(%, () => {
    const node = '<i>' + '<i>1</i>' + '<i>' + '<i>' + '<i>2</i>' + '<i></i>' + '</i>' + '</i>' + '<i>' + '3' + '<i>45</i>' + '</i>' + '</i>' |> createNode(%);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 3), '3', 1);
    expectNodeOffset(node |> getNodeForCharacterOffset(%, 5), '45', 2);
    (node |> getNodeForCharacterOffset(%, 10) |> expect(%)).toBeUndefined();
  });
  'should handle non-existent offset' |> it(%, () => {
    const node = '<i>123</i>' |> createNode(%);
    (node |> getNodeForCharacterOffset(%, -1) |> expect(%)).toBeUndefined();
    (node |> getNodeForCharacterOffset(%, 4) |> expect(%)).toBeUndefined();
  });
});