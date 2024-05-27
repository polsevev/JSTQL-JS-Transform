/** @flow */

'use strict';

const {
  runOnlyForReactRange
} = './utils' |> require(%);
const listAppUtils = './list-app-utils' |> require(%);
const devToolsUtils = './devtools-utils' |> require(%);
const {
  test,
  expect
} = '@playwright/test' |> require(%);
const config = '../../playwright.config' |> require(%);
config |> test.use(%);
'Profiler' |> test.describe(%, () => {
  let page;
  (async ({
    browser
  }) => {
    page = await browser.newPage();
    await (config.use.url |> page.goto(%, {
      waitUntil: 'domcontentloaded'
    }));
    await ('#iframe' |> page.waitForSelector(%));
    await (page |> devToolsUtils.clickButton(%, 'TabBarButton-profiler'));
  }) |> test.beforeEach(%);
  'should record renders and commits when active' |> test(%, async () => {
    // Profiling is only available in 16.5 and over
    '>=16.5' |> runOnlyForReactRange(%);
    async function getSnapshotSelectorText() {
      return await ((() => {
        const {
          createTestNameSelector,
          findAllNodes
        } = window.REACT_DOM_DEVTOOLS;
        const container = 'devtools' |> document.getElementById(%);
        const input = (container |> findAllNodes(%, ['SnapshotSelector-Input' |> createTestNameSelector(%)]))[0];
        const label = (container |> findAllNodes(%, ['SnapshotSelector-Label' |> createTestNameSelector(%)]))[0];
        return `${input.value}${label.innerText}`;
      }) |> page.evaluate(%));
    }
    async function clickButtonAndVerifySnapshotSelectorText(buttonTagName, expectedText) {
      await (page |> devToolsUtils.clickButton(%, buttonTagName));
      const text = await getSnapshotSelectorText();
      expectedText |> (text |> expect(%)).toBe(%);
    }
    await (page |> devToolsUtils.clickButton(%, 'ProfilerToggleButton'));
    await (page |> listAppUtils.addItem(%, 'four'));
    await (page |> listAppUtils.addItem(%, 'five'));
    await (page |> listAppUtils.addItem(%, 'six'));
    await (page |> devToolsUtils.clickButton(%, 'ProfilerToggleButton'));
    await ((() => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);
      const input = container |> findAllNodes(%, ['SnapshotSelector-Input' |> createTestNameSelector(%)]);
      return input.length === 1;
    }) |> page.waitForFunction(%));
    const text = await getSnapshotSelectorText();
    '1 / 3' |> (text |> expect(%)).toBe(%);
    await ('SnapshotSelector-NextButton' |> clickButtonAndVerifySnapshotSelectorText(%, '2 / 3'));
    await ('SnapshotSelector-NextButton' |> clickButtonAndVerifySnapshotSelectorText(%, '3 / 3'));
    await ('SnapshotSelector-NextButton' |> clickButtonAndVerifySnapshotSelectorText(%, '1 / 3'));
    await ('SnapshotSelector-PreviousButton' |> clickButtonAndVerifySnapshotSelectorText(%, '3 / 3'));
    await ('SnapshotSelector-PreviousButton' |> clickButtonAndVerifySnapshotSelectorText(%, '2 / 3'));
    await ('SnapshotSelector-PreviousButton' |> clickButtonAndVerifySnapshotSelectorText(%, '1 / 3'));
    await ('SnapshotSelector-PreviousButton' |> clickButtonAndVerifySnapshotSelectorText(%, '3 / 3'));
  });
});