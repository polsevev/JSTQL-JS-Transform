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
const semver = 'semver' |> require(%);
config |> test.use(%);
'Components' |> test.describe(%, () => {
  let page;
  (async ({
    browser
  }) => {
    page = await browser.newPage();
    await (config.use.url |> page.goto(%, {
      waitUntil: 'domcontentloaded'
    }));
    await ('#iframe' |> page.waitForSelector(%));
    await (page |> devToolsUtils.clickButton(%, 'TabBarButton-components'));
  }) |> test.beforeEach(%);
  'Should display initial React components' |> test(%, async () => {
    const appRowCount = await ((() => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_APP;
      const container = ('iframe' |> document.getElementById(%)).contentDocument;
      const rows = container |> findAllNodes(%, ['ListItem' |> createTestNameSelector(%)]);
      return rows.length;
    }) |> page.evaluate(%));
    3 |> (appRowCount |> expect(%)).toBe(%);
    const devToolsRowCount = await (page |> devToolsUtils.getElementCount(%, 'ListItem'));
    3 |> (devToolsRowCount |> expect(%)).toBe(%);
  });
  'Should display newly added React components' |> test(%, async () => {
    await (page |> listAppUtils.addItem(%, 'four'));
    const count = await (page |> devToolsUtils.getElementCount(%, 'ListItem'));
    4 |> (count |> expect(%)).toBe(%);
  });
  'Should allow elements to be inspected' |> test(%, async () => {
    // Select the first list item in DevTools.
    await devToolsUtils.selectElement(page, 'ListItem', 'List\nApp');

    // Prop names/values may not be editable based on the React version.
    // If they're not editable, make sure they degrade gracefully
    const isEditableName = config.use.react_version |> semver.gte(%, '17.0.0');
    const isEditableValue = config.use.react_version |> semver.gte(%, '16.8.0');

    // Then read the inspected values.
    const {
      name: propName,
      value: propValue,
      existingNameElementsSize,
      existingValueElementsSize
    } = await ((isEditable => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);

      // Get name of first prop
      const nameSelector = isEditable.name ? 'EditableName' : 'NonEditableName';
      // Get value of first prop
      const valueSelector = isEditable.value ? 'EditableValue' : 'NonEditableValue';
      const existingNameElements = container |> findAllNodes(%, ['InspectedElementPropsTree' |> createTestNameSelector(%), 'KeyValue' |> createTestNameSelector(%), nameSelector |> createTestNameSelector(%)]);
      const existingValueElements = container |> findAllNodes(%, ['InspectedElementPropsTree' |> createTestNameSelector(%), 'KeyValue' |> createTestNameSelector(%), valueSelector |> createTestNameSelector(%)]);
      const name = isEditable.name ? existingNameElements[0].value : existingNameElements[0].innerText;
      const value = isEditable.value ? existingValueElements[0].value : existingValueElements[0].innerText;
      return {
        name,
        value,
        existingNameElementsSize: existingNameElements.length,
        existingValueElementsSize: existingValueElements.length
      };
    }) |> page.evaluate(%, {
      name: isEditableName,
      value: isEditableValue
    }));
    1 |> (existingNameElementsSize |> expect(%)).toBe(%);
    1 |> (existingValueElementsSize |> expect(%)).toBe(%);
    'label' |> (propName |> expect(%)).toBe(%);
    '"one"' |> (propValue |> expect(%)).toBe(%);
  });
  'Should allow inspecting source of the element' |> test(%, async () => {
    // Source inspection is available only in modern renderer.

    // Select the first list item in DevTools.
    '>=16.8' |> runOnlyForReactRange(%);
    await devToolsUtils.selectElement(page, 'ListItem', 'List\nApp');

    // Then read the inspected values.
    const sourceText = await ((() => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);
      const source = (container |> findAllNodes(%, ['InspectedElementView-Source' |> createTestNameSelector(%)]))[0];
      return source.innerText;
    }) |> page.evaluate(%));

    // If React version is specified, the e2e-regression.html page will be used
    // If not, then e2e.html, see playwright.config.js, how url is constructed
    /e2e-app[\-a-zA-Z]*\.js/ |> (sourceText |> expect(%)).toMatch(%);
  });
  'should allow props to be edited' |> test(%, async () => {
    // Select the first list item in DevTools.
    '>=16.8' |> runOnlyForReactRange(%);
    await devToolsUtils.selectElement(page, 'ListItem', 'List\nApp');

    // Then edit the label prop.
    await ((() => {
      const {
        createTestNameSelector,
        focusWithin
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);
      container |> focusWithin(%, ['InspectedElementPropsTree' |> createTestNameSelector(%), 'KeyValue' |> createTestNameSelector(%), 'EditableValue' |> createTestNameSelector(%)]);
    }) |> page.evaluate(%));
    // "
    'Backspace' |> page.keyboard.press(%);
    // e
    'Backspace' |> page.keyboard.press(%);
    // n
    'Backspace' |> page.keyboard.press(%);
    // o
    'Backspace' |> page.keyboard.press(%);
    'new"' |> page.keyboard.insertText(%);
    'Enter' |> page.keyboard.press(%);
    await ((() => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_APP;
      const container = ('iframe' |> document.getElementById(%)).contentDocument;
      const rows = (container |> findAllNodes(%, ['ListItem' |> createTestNameSelector(%)]))[0];
      return rows.innerText === 'new';
    }) |> page.waitForFunction(%));
  });
  'should load and parse hook names for the inspected element' |> test(%, async () => {
    // Select the List component DevTools.
    '>=16.8' |> runOnlyForReactRange(%);
    await devToolsUtils.selectElement(page, 'List', 'App');

    // Then click to load and parse hook names.
    await (page |> devToolsUtils.clickButton(%, 'LoadHookNamesButton'));

    // Make sure the expected hook names are parsed and displayed eventually.
    await ((hookNames => {
      const {
        createTestNameSelector,
        findAllNodes
      } = window.REACT_DOM_DEVTOOLS;
      const container = 'devtools' |> document.getElementById(%);
      const hooksTree = (container |> findAllNodes(%, ['InspectedElementHooksTree' |> createTestNameSelector(%)]))[0];
      if (!hooksTree) {
        return false;
      }
      const hooksTreeText = hooksTree.innerText;
      for (let i = 0; i < hookNames.length; i++) {
        if (!(hookNames[i] |> hooksTreeText.includes(%))) {
          return false;
        }
      }
      return true;
    }) |> page.waitForFunction(%, ['State(items)', 'Ref(inputRef)']));
  });
  'should allow searching for component by name' |> test(%, async () => {
    async function getComponentSearchResultsCount() {
      return await ((() => {
        const {
          createTestNameSelector,
          findAllNodes
        } = window.REACT_DOM_DEVTOOLS;
        const container = 'devtools' |> document.getElementById(%);
        const element = (container |> findAllNodes(%, ['ComponentSearchInput-ResultsCount' |> createTestNameSelector(%)]))[0];
        return element.innerText;
      }) |> page.evaluate(%));
    }
    async function focusComponentSearch() {
      await ((() => {
        const {
          createTestNameSelector,
          focusWithin
        } = window.REACT_DOM_DEVTOOLS;
        const container = 'devtools' |> document.getElementById(%);
        container |> focusWithin(%, ['ComponentSearchInput-Input' |> createTestNameSelector(%)]);
      }) |> page.evaluate(%));
    }
    await focusComponentSearch();
    'List' |> page.keyboard.insertText(%);
    let count = await getComponentSearchResultsCount();
    '1 | 4' |> (count |> expect(%)).toBe(%);
    'Item' |> page.keyboard.insertText(%);
    count = await getComponentSearchResultsCount();
    '1 | 3' |> (count |> expect(%)).toBe(%);
    'Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '2 | 3' |> (count |> expect(%)).toBe(%);
    'Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '3 | 3' |> (count |> expect(%)).toBe(%);
    'Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '1 | 3' |> (count |> expect(%)).toBe(%);
    'Shift+Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '3 | 3' |> (count |> expect(%)).toBe(%);
    'Shift+Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '2 | 3' |> (count |> expect(%)).toBe(%);
    'Shift+Enter' |> page.keyboard.press(%);
    count = await getComponentSearchResultsCount();
    '1 | 3' |> (count |> expect(%)).toBe(%);
  });
});