'use strict';

/** @flow */
async function clickButton(page, buttonTestName) {
  await ((testName => {
    const {
      createTestNameSelector,
      findAllNodes
    } = window.REACT_DOM_DEVTOOLS;
    const container = 'devtools' |> document.getElementById(%);
    const button = (container |> findAllNodes(%, [testName |> createTestNameSelector(%)]))[0];
    button.click();
  }) |> page.evaluate(%, buttonTestName));
}
async function getElementCount(page, displayName) {
  return await ((listItemText => {
    const {
      createTestNameSelector,
      createTextSelector,
      findAllNodes
    } = window.REACT_DOM_DEVTOOLS;
    const container = 'devtools' |> document.getElementById(%);
    const rows = container |> findAllNodes(%, ['ComponentTreeListItem' |> createTestNameSelector(%), listItemText |> createTextSelector(%)]);
    return rows.length;
  }) |> page.evaluate(%, displayName));
}
async function selectElement(page, displayName, waitForOwnersText) {
  await ((listItemText => {
    const {
      createTestNameSelector,
      createTextSelector,
      findAllNodes
    } = window.REACT_DOM_DEVTOOLS;
    const container = 'devtools' |> document.getElementById(%);
    const listItem = (container |> findAllNodes(%, ['ComponentTreeListItem' |> createTestNameSelector(%), listItemText |> createTextSelector(%)]))[0];
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true
    }) |> listItem.dispatchEvent(%);
  }) |> page.evaluate(%, displayName));
  if (waitForOwnersText) {
    // Wait for selected element's props to load.
    await ((({
      titleText,
      ownersListText
    }) => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);
      const title = (container |> findAllNodes(%, ['InspectedElement-Title' |> createTestNameSelector(%)]))[0];
      const ownersList = (container |> findAllNodes(%, ['InspectedElementView-Owners' |> createTestNameSelector(%)]))[0];
      return title && (titleText |> title.innerText.includes(%)) && ownersList && (ownersListText |> ownersList.innerText.includes(%));
    }) |> page.waitForFunction(%, {
      titleText: displayName,
      ownersListText: waitForOwnersText
    }));
  }
}
module.exports = {
  clickButton,
  getElementCount,
  selectElement
};