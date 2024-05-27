'use strict';

/** @flow */
async function addItem(page, newItemText) {
  await ((text => {
    const {
      createTestNameSelector,
      findAllNodes
    } = window.REACT_DOM_APP;
    const container = ('iframe' |> document.getElementById(%)).contentDocument;
    const input = (container |> findAllNodes(%, ['AddItemInput' |> createTestNameSelector(%)]))[0];
    input.value = text;
    const button = (container |> findAllNodes(%, ['AddItemButton' |> createTestNameSelector(%)]))[0];
    button.click();
  }) |> page.evaluate(%, newItemText));
}
module.exports = {
  addItem
};