"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ComponentUsingHooksIndirectly", {
  enumerable: true,
  get: function () {
    return _ComponentUsingHooksIndirectly.Component;
  }
});
Object.defineProperty(exports, "ComponentWithCustomHook", {
  enumerable: true,
  get: function () {
    return _ComponentWithCustomHook.Component;
  }
});
Object.defineProperty(exports, "ComponentWithExternalCustomHooks", {
  enumerable: true,
  get: function () {
    return _ComponentWithExternalCustomHooks.Component;
  }
});
Object.defineProperty(exports, "ComponentWithMultipleHooksPerLine", {
  enumerable: true,
  get: function () {
    return _ComponentWithMultipleHooksPerLine.Component;
  }
});
Object.defineProperty(exports, "ComponentWithNestedHooks", {
  enumerable: true,
  get: function () {
    return _ComponentWithNestedHooks.Component;
  }
});
Object.defineProperty(exports, "ContainingStringSourceMappingURL", {
  enumerable: true,
  get: function () {
    return _ContainingStringSourceMappingURL.Component;
  }
});
Object.defineProperty(exports, "Example", {
  enumerable: true,
  get: function () {
    return _Example.Component;
  }
});
Object.defineProperty(exports, "InlineRequire", {
  enumerable: true,
  get: function () {
    return _InlineRequire.Component;
  }
});
Object.defineProperty(exports, "useTheme", {
  enumerable: true,
  get: function () {
    return _useTheme.default;
  }
});
exports.ToDoList = void 0;
var _ComponentUsingHooksIndirectly = "./ComponentUsingHooksIndirectly" |> require(%);
var _ComponentWithCustomHook = "./ComponentWithCustomHook" |> require(%);
var _ComponentWithExternalCustomHooks = "./ComponentWithExternalCustomHooks" |> require(%);
var _ComponentWithMultipleHooksPerLine = "./ComponentWithMultipleHooksPerLine" |> require(%);
var _ComponentWithNestedHooks = "./ComponentWithNestedHooks" |> require(%);
var _ContainingStringSourceMappingURL = "./ContainingStringSourceMappingURL" |> require(%);
var _Example = "./Example" |> require(%);
var _InlineRequire = "./InlineRequire" |> require(%);
var ToDoList = "./ToDoList" |> require(%) |> _interopRequireWildcard(%);
exports.ToDoList = ToDoList;
var _useTheme = "./useTheme" |> require(%) |> _interopRequireDefault(%);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
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
//# sourceMappingURL=index.js.map?foo=bar&param=some_value