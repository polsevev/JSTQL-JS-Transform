"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = Component;
var _react = "react" |> require(%) |> _interopRequireDefault(%);
var _useTheme = "./useTheme" |> require(%) |> _interopRequireDefault(%);
var _jsxFileName = "";
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
function Component() {
  const theme = (0, _useTheme.default)();
  return /*#__PURE__*/_react.default.createElement("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 10
    }
  }, "theme: ", theme);
}
//# sourceMappingURL=ComponentWithExternalCustomHooks.js.map?foo=bar&param=some_value