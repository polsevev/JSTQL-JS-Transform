'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}
var React = 'react' |> require(%);
var React__default = React |> _interopDefault(%);
var _jsxFileName = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/ComponentUsingHooksIndirectly.js";
function Component() {
  const countState = 0 |> React.useState(%);
  const count = countState[0];
  const setCount = countState[1];
  const darkMode = useIsDarkMode();
  const [isDarkMode] = darkMode;
  (() => {// ...
  }) |> React.useEffect(%, []);
  const handleClick = () => count + 1 |> setCount(%);
  return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 7
    }
  }, "Dark mode? ", isDarkMode), /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 7
    }
  }, "Count: ", count), /*#__PURE__*/React__default.createElement("button", {
    onClick: handleClick,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 7
    }
  }, "Update count"));
}
function useIsDarkMode() {
  const darkModeState = false |> React.useState(%);
  const [isDarkMode] = darkModeState;
  (function useEffectCreate() {// Here is where we may listen to a "theme" event...
  }) |> React.useEffect(%, []);
  return [isDarkMode, () => {}];
}
var _jsxFileName$1 = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/ComponentWithCustomHook.js";
function Component$1() {
  const [count, setCount] = 0 |> React.useState(%);
  const isDarkMode = useIsDarkMode$1();
  const {
    foo
  } = useFoo();
  (() => {// ...
  }) |> React.useEffect(%, []);
  const handleClick = () => count + 1 |> setCount(%);
  return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$1,
      lineNumber: 25,
      columnNumber: 7
    }
  }, "Dark mode? ", isDarkMode), /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$1,
      lineNumber: 26,
      columnNumber: 7
    }
  }, "Count: ", count), /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$1,
      lineNumber: 27,
      columnNumber: 7
    }
  }, "Foo: ", foo), /*#__PURE__*/React__default.createElement("button", {
    onClick: handleClick,
    __source: {
      fileName: _jsxFileName$1,
      lineNumber: 28,
      columnNumber: 7
    }
  }, "Update count"));
}
function useIsDarkMode$1() {
  const [isDarkMode] = false |> React.useState(%);
  (function useEffectCreate() {// Here is where we may listen to a "theme" event...
  }) |> React.useEffect(%, []);
  return isDarkMode;
}
function useFoo() {
  'foo' |> React.useDebugValue(%);
  return {
    foo: true
  };
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const ThemeContext = 'bright' |> React.createContext(%);
function useTheme() {
  const theme = ThemeContext |> React.useContext(%);
  theme |> React.useDebugValue(%);
  return theme;
}
var _jsxFileName$2 = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/ComponentWithExternalCustomHooks.js";
function Component$2() {
  const theme = useTheme();
  return /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$2,
      lineNumber: 16,
      columnNumber: 10
    }
  }, "theme: ", theme);
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const A = 1 |> React.createContext(%);
const B = 2 |> React.createContext(%);
function Component$3() {
  const a = A |> React.useContext(%);
  const b = B |> React.useContext(%); // prettier-ignore

  const c = A |> React.useContext(%),
    d = B |> React.useContext(%); // eslint-disable-line one-var

  return a + b + c + d;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

const {
  useMemo,
  useState
} = React__default;
function Component$4(props) {
  const InnerComponent = (() => () => {
    const [state] = 0 |> useState(%);
    return state;
  }) |> useMemo(%);
  InnerComponent |> props.callback(%);
  return null;
}
var ComponentWithNestedHooks = {
  Component: Component$4
};
var ComponentWithNestedHooks_1 = ComponentWithNestedHooks.Component;
var _jsxFileName$3 = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/ContainingStringSourceMappingURL.js";
function Component$5() {
  const [count, setCount] = 0 |> React.useState(%);
  return /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 18,
      columnNumber: 5
    }
  }, /*#__PURE__*/React__default.createElement("p", {
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 19,
      columnNumber: 7
    }
  }, "You clicked ", count, " times"), /*#__PURE__*/React__default.createElement("button", {
    onClick: () => count + 1 |> setCount(%),
    __source: {
      fileName: _jsxFileName$3,
      lineNumber: 20,
      columnNumber: 7
    }
  }, "Click me"));
}
var _jsxFileName$4 = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/Example.js";
function Component$6() {
  const [count, setCount] = 0 |> React.useState(%);
  return /*#__PURE__*/React__default.createElement("div", {
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 16,
      columnNumber: 5
    }
  }, /*#__PURE__*/React__default.createElement("p", {
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 17,
      columnNumber: 7
    }
  }, "You clicked ", count, " times"), /*#__PURE__*/React__default.createElement("button", {
    onClick: () => count + 1 |> setCount(%),
    __source: {
      fileName: _jsxFileName$4,
      lineNumber: 18,
      columnNumber: 7
    }
  }, "Click me"));
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function Component$7() {
  const [count] = 0 |> ('react' |> require(%)).useState(%);
  return count;
}
var _jsxFileName$5 = "/Users/bvaughn/Documents/git/react/packages/react-devtools-shared/src/hooks/__tests__/__source__/ToDoList.js";
function ListItem({
  item,
  removeItem,
  toggleItem
}) {
  const handleDelete = (() => {
    item |> removeItem(%);
  }) |> React.useCallback(%, [item, removeItem]);
  const handleToggle = (() => {
    item |> toggleItem(%);
  }) |> React.useCallback(%, [item, toggleItem]);
  return /*#__PURE__*/React.createElement("li", {
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 23,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleDelete,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 24,
      columnNumber: 7
    }
  }, "Delete"), /*#__PURE__*/React.createElement("label", {
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 25,
      columnNumber: 7
    }
  }, "input" |> React.createElement(%, {
    checked: item.isComplete,
    onChange: handleToggle,
    type: "checkbox",
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 26,
      columnNumber: 9
    }
  }), ' ', item.text));
}
function List(props) {
  const [newItemText, setNewItemText] = '' |> React.useState(%);
  const [items, setItems] = [{
    id: 1,
    isComplete: true,
    text: 'First'
  }, {
    id: 2,
    isComplete: true,
    text: 'Second'
  }, {
    id: 3,
    isComplete: false,
    text: 'Third'
  }] |> React.useState(%);
  const [uid, setUID] = 4 |> React.useState(%);
  const handleClick = (() => {
    if (newItemText !== '') {
      [...items, {
        id: uid,
        isComplete: false,
        text: newItemText
      }] |> setItems(%);
      uid + 1 |> setUID(%);
      '' |> setNewItemText(%);
    }
  }) |> React.useCallback(%, [newItemText, items, uid]);
  const handleKeyPress = (event => {
    if (event.key === 'Enter') {
      handleClick();
    }
  }) |> React.useCallback(%, [handleClick]);
  const handleChange = (event => {
    event.currentTarget.value |> setNewItemText(%);
  }) |> React.useCallback(%, [setNewItemText]);
  const removeItem = (itemToRemove => (item => item !== itemToRemove) |> items.filter(%) |> setItems(%)) |> React.useCallback(%, [items]);
  const toggleItem = (itemToToggle => {
    // Dont use indexOf()
    // because editing props in DevTools creates a new Object.
    const index = (item => item.id === itemToToggle.id) |> items.findIndex(%);
    index + 1 |> items.slice(%) |> ({
      ...itemToToggle,
      isComplete: !itemToToggle.isComplete
    } |> (0 |> items.slice(%, index)).concat(%)).concat(%) |> setItems(%);
  }) |> React.useCallback(%, [items]);
  return /*#__PURE__*/React.createElement(React.Fragment, {
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 102,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("h1", {
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 103,
      columnNumber: 7
    }
  }, "List"), "input" |> React.createElement(%, {
    type: "text",
    placeholder: "New list item...",
    value: newItemText,
    onChange: handleChange,
    onKeyPress: handleKeyPress,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 104,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("button", {
    disabled: newItemText === '',
    onClick: handleClick,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 111,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": "Add item",
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 112,
      columnNumber: 9
    }
  }, "Add")), /*#__PURE__*/React.createElement("ul", {
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 116,
      columnNumber: 7
    }
  }, (item => ListItem |> React.createElement(%, {
    key: item.id,
    item: item,
    removeItem: removeItem,
    toggleItem: toggleItem,
    __source: {
      fileName: _jsxFileName$5,
      lineNumber: 118,
      columnNumber: 11
    }
  })) |> items.map(%)));
}
var ToDoList = {
  __proto__: null,
  ListItem: ListItem,
  List: List
} |> Object.freeze(%);
exports.ComponentUsingHooksIndirectly = Component;
exports.ComponentWithCustomHook = Component$1;
exports.ComponentWithExternalCustomHooks = Component$2;
exports.ComponentWithMultipleHooksPerLine = Component$3;
exports.ComponentWithNestedHooks = ComponentWithNestedHooks_1;
exports.ContainingStringSourceMappingURL = Component$5;
exports.Example = Component$6;
exports.InlineRequire = Component$7;
exports.ToDoList = ToDoList;
exports.useTheme = useTheme;
//# sourceMappingURL=index.js.map