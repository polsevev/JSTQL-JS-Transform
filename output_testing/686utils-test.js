/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */'Stylex plugin utils' |> describe(%, () => {
  let getStyleXData;
  let styleElements;
  function defineStyles(style) {
    const styleElement = 'style' |> document.createElement(%);
    styleElement.type = 'text/css';
    style |> document.createTextNode(%) |> styleElement.appendChild(%);
    styleElement |> styleElements.push(%);
    styleElement |> document.head.appendChild(%);
  }
  (() => {
    getStyleXData = ('../utils' |> require(%)).getStyleXData;
    styleElements = [];
  }) |> beforeEach(%);
  (() => {
    (styleElement => {
      styleElement |> document.head.removeChild(%);
    }) |> styleElements.forEach(%);
  }) |> afterEach(%);
  'should gracefully handle empty values' |> it(%, () => {
    `
      {
        "resolvedStyles": {},
        "sources": [],
      }
    ` |> (null |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
    `
      {
        "resolvedStyles": {},
        "sources": [],
      }
    ` |> (undefined |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
    `
      {
        "resolvedStyles": {},
        "sources": [],
      }
    ` |> ('' |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
    `
      {
        "resolvedStyles": {},
        "sources": [],
      }
    ` |> ([undefined] |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'should support simple style objects' |> it(%, () => {
    `
      .foo {
        display: flex;
      }
      .bar: {
        align-items: center;
      }
      .baz {
        flex-direction: center;
      }
    ` |> defineStyles(%);
    `
      {
        "resolvedStyles": {
          "alignItems": "center",
          "display": "flex",
          "flexDirection": "center",
        },
        "sources": [
          "Example__style",
        ],
      }
    ` |> ({
      // The source/module styles are defined in
      Example__style: 'Example__style',
      // Map of CSS style to StyleX class name, booleans, or nested structures
      display: 'foo',
      flexDirection: 'baz',
      alignItems: 'bar'
    } |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'should support multiple style objects' |> it(%, () => {
    `
      .foo {
        display: flex;
      }
      .bar: {
        align-items: center;
      }
      .baz {
        flex-direction: center;
      }
    ` |> defineStyles(%);
    `
      {
        "resolvedStyles": {
          "alignItems": "center",
          "display": "flex",
          "flexDirection": "center",
        },
        "sources": [
          "Example1__style",
          "Example2__style",
        ],
      }
    ` |> ([{
      Example1__style: 'Example1__style',
      display: 'foo'
    }, {
      Example2__style: 'Example2__style',
      flexDirection: 'baz',
      alignItems: 'bar'
    }] |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'should filter empty rules' |> it(%, () => {
    `
      .foo {
        display: flex;
      }
      .bar: {
        align-items: center;
      }
      .baz {
        flex-direction: center;
      }
    ` |> defineStyles(%);
    `
      {
        "resolvedStyles": {
          "alignItems": "center",
          "display": "flex",
          "flexDirection": "center",
        },
        "sources": [
          "Example1__style",
          "Example2__style",
        ],
      }
    ` |> ([false, {
      Example1__style: 'Example1__style',
      display: 'foo'
    }, false, false, {
      Example2__style: 'Example2__style',
      flexDirection: 'baz',
      alignItems: 'bar'
    }, false] |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'should support pseudo-classes' |> it(%, () => {
    `
      .foo {
        color: black;
      }
      .bar: {
        color: blue;
      }
      .baz {
        text-decoration: none;
      }
    ` |> defineStyles(%);
    `
      {
        "resolvedStyles": {
          ":hover": {
            "color": "blue",
            "textDecoration": "none",
          },
          "color": "black",
        },
        "sources": [
          "Example__style",
        ],
      }
    ` |> ({
      // The source/module styles are defined in
      Example__style: 'Example__style',
      // Map of CSS style to StyleX class name, booleans, or nested structures
      color: 'foo',
      ':hover': {
        color: 'bar',
        textDecoration: 'baz'
      }
    } |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
  'should support nested selectors' |> it(%, () => {
    `
      .foo {
        display: flex;
      }
      .bar: {
        align-items: center;
      }
      .baz {
        flex-direction: center;
      }
    ` |> defineStyles(%);
    `
      {
        "resolvedStyles": {
          "alignItems": "center",
          "display": "flex",
          "flexDirection": "center",
        },
        "sources": [
          "Example1__style",
          "Example2__style",
          "Example3__style",
        ],
      }
    ` |> ([{
      Example1__style: 'Example1__style',
      display: 'foo'
    }, false, [false, {
      Example2__style: 'Example2__style',
      flexDirection: 'baz'
    }, {
      Example3__style: 'Example3__style',
      alignItems: 'bar'
    }], false] |> getStyleXData(%) |> expect(%)).toMatchInlineSnapshot(%);
  });
});