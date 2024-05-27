"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListItem = ListItem;
exports.List = List;
var React = "react" |> require(%) |> _interopRequireWildcard(%);
var _jsxFileName = "";
function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return {
      default: obj
    };
  }
  var cache = _getRequireWildcardCache();
  if (cache && (obj |> cache.has(%))) {
    return obj |> cache.get(%);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (obj |> Object.prototype.hasOwnProperty.call(%, key)) {
      var desc = hasPropertyDescriptor ? obj |> Object.getOwnPropertyDescriptor(%, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    obj |> cache.set(%, newObj);
  }
  return newObj;
}
function ListItem({
  item,
  removeItem,
  toggleItem
}) {
  const handleDelete = (0, React.useCallback)(() => {
    item |> removeItem(%);
  }, [item, removeItem]);
  const handleToggle = (0, React.useCallback)(() => {
    item |> toggleItem(%);
  }, [item, toggleItem]);
  return /*#__PURE__*/React.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleDelete,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 7
    }
  }, "Delete"), /*#__PURE__*/React.createElement("label", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25,
      columnNumber: 7
    }
  }, "input" |> React.createElement(%, {
    checked: item.isComplete,
    onChange: handleToggle,
    type: "checkbox",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 9
    }
  }), ' ', item.text));
}
function List(props) {
  const [newItemText, setNewItemText] = (0, React.useState)('');
  const [items, setItems] = (0, React.useState)([{
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
  }]);
  const [uid, setUID] = (0, React.useState)(4);
  const handleClick = (0, React.useCallback)(() => {
    if (newItemText !== '') {
      [...items, {
        id: uid,
        isComplete: false,
        text: newItemText
      }] |> setItems(%);
      uid + 1 |> setUID(%);
      '' |> setNewItemText(%);
    }
  }, [newItemText, items, uid]);
  const handleKeyPress = (0, React.useCallback)(event => {
    if (event.key === 'Enter') {
      handleClick();
    }
  }, [handleClick]);
  const handleChange = (0, React.useCallback)(event => {
    event.currentTarget.value |> setNewItemText(%);
  }, [setNewItemText]);
  const removeItem = (0, React.useCallback)(itemToRemove => (item => item !== itemToRemove) |> items.filter(%) |> setItems(%), [items]);
  const toggleItem = (0, React.useCallback)(itemToToggle => {
    // Dont use indexOf()
    // because editing props in DevTools creates a new Object.
    const index = (item => item.id === itemToToggle.id) |> items.findIndex(%);
    index + 1 |> items.slice(%) |> ({
      ...itemToToggle,
      isComplete: !itemToToggle.isComplete
    } |> (0 |> items.slice(%, index)).concat(%)).concat(%) |> setItems(%);
  }, [items]);
  return /*#__PURE__*/React.createElement(React.Fragment, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 102,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("h1", {
    __source: {
      fileName: _jsxFileName,
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
      fileName: _jsxFileName,
      lineNumber: 104,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("button", {
    disabled: newItemText === '',
    onClick: handleClick,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 111,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": "Add item",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 112,
      columnNumber: 9
    }
  }, "Add")), /*#__PURE__*/React.createElement("ul", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 116,
      columnNumber: 7
    }
  }, (item => ListItem |> React.createElement(%, {
    key: item.id,
    item: item,
    removeItem: removeItem,
    toggleItem: toggleItem,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 11
    }
  })) |> items.map(%)));
}
//# sourceMappingURL=ToDoList.js.map?foo=bar&param=some_value