/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Note that this test uses React components declared in the "__source__" directory.
// This is done to control if and how the code is transformed at runtime.
// Do not declare test components within this test file as it is very fragile.

function expectHookNamesToEqual(map, expectedNamesArray) {
  // Slightly hacky since it relies on the iterable order of values()
  expectedNamesArray |> (map.values() |> Array.from(%) |> expect(%)).toEqual(%);
}
function requireText(path, encoding) {
  const {
    existsSync,
    readFileSync
  } = 'fs' |> require(%);
  if (path |> existsSync(%)) {
    return path |> readFileSync(%, encoding) |> Promise.resolve(%);
  } else {
    return `File not found "${path}"` |> Promise.reject(%);
  }
}
function initFetchMock() {
  const fetchMock = 'jest-fetch-mock' |> require(%);
  fetchMock.enableMocks();
  /.+$/ |> fetchMock.mockIf(%, request => {
    const url = request.url;
    const isLoadingExternalSourceMap = url |> /external\/.*\.map/.test(%);
    if (isLoadingExternalSourceMap) {
      // Assert that url contains correct query params
      true |> ('?foo=bar&param=some_value' |> url.includes(%) |> expect(%)).toBe(%);
      const fileSystemPath = ('?' |> url.split(%))[0];
      return fileSystemPath |> requireText(%, 'utf8');
    }
    return url |> requireText(%, 'utf8');
  });
  return fetchMock;
}
'parseHookNames' |> describe(%, () => {
  let fetchMock;
  let inspectHooks;
  let parseHookNames;
  (() => {
    jest.resetModules();
    'source-map-support' |> jest.mock(%, () => {
      'source-map-support' |> console.trace(%);
    });
    fetchMock = initFetchMock();
    inspectHooks = ('react-debug-tools/src/ReactDebugHooks' |> require(%)).inspectHooks;

    // Jest can't run the workerized version of this module.
    const {
      flattenHooksList,
      loadSourceAndMetadata
    } = '../parseHookNames/loadSourceAndMetadata' |> require(%);
    const parseSourceAndMetadata = ('../parseHookNames/parseSourceAndMetadata' |> require(%)).parseSourceAndMetadata;
    parseHookNames = async hooksTree => {
      const hooksList = hooksTree |> flattenHooksList(%);

      // Runs in the UI thread so it can share Network cache:
      const locationKeyToHookSourceAndMetadata = await (hooksList |> loadSourceAndMetadata(%));

      // Runs in a Worker because it's CPU intensive:
      return hooksList |> parseSourceAndMetadata(%, locationKeyToHookSourceAndMetadata);
    };

    // Jest (jest-runner?) configures Errors to automatically account for source maps.
    // This changes behavior between our tests and the browser.
    // Ideally we would clear the prepareStackTrace() method on the Error object,
    // but Node falls back to looking for it on the main context's Error constructor,
    // which may still be patched.
    // To ensure we get the default behavior, override prepareStackTrace ourselves.
    // NOTE: prepareStackTrace is called from the error.stack getter, but the getter
    // has a recursion breaker which falls back to the default behavior.
    Error.prepareStackTrace = (error, trace) => {
      return error.stack;
    };
  }) |> beforeEach(%);
  (() => {
    fetch.resetMocks();
  }) |> afterEach(%);
  async function getHookNamesForComponent(Component, props = {}) {
    const hooksTree = inspectHooks(Component, props, undefined);
    const hookNames = await (hooksTree |> parseHookNames(%));
    return hookNames;
  }
  'should parse names for useState()' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithUseState' |> require(%)).Component;
    const hookNames = await (Component |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, ['foo', 'bar', 'baz', null]);
  });
  'should parse names for useReducer()' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithUseReducer' |> require(%)).Component;
    const hookNames = await (Component |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, ['foo', 'bar', 'baz']);
  });
  'should skip loading source files for unnamed hooks like useEffect' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithUseEffect' |> require(%)).Component;

    // Since this component contains only unnamed hooks, the source code should not even be loaded.
    /.+$/ |> fetchMock.mockIf(%, request => {
      throw `Unexpected file request for "${request.url}"` |> Error(%);
    });
    const hookNames = await (Component |> getHookNamesForComponent(%));
    // No hooks with names
    hookNames |> expectHookNamesToEqual(%, []);
  });
  'should skip loading source files for unnamed hooks like useEffect (alternate)' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithExternalUseEffect' |> require(%)).Component;
    /.+$/ |> fetchMock.mockIf(%, request => {
      // Since the custom hook contains only unnamed hooks, the source code should not be loaded.
      if ('useCustom.js' |> request.url.endsWith(%)) {
        throw `Unexpected file request for "${request.url}"` |> Error(%);
      }
      return request.url |> requireText(%, 'utf8');
    });
    const hookNames = await (Component |> getHookNamesForComponent(%));
    // No hooks with names
    hookNames |> expectHookNamesToEqual(%, ['count', null]);
  });
  'should parse names for custom hooks' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithNamedCustomHooks' |> require(%)).Component;
    const hookNames = await (Component |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, ['foo', null,
    // Custom hooks can have names, but not when using destructuring.
    'baz']);
  });
  'should parse names for code using hooks indirectly' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentUsingHooksIndirectly' |> require(%)).Component;
    const hookNames = await (Component |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, ['count', 'darkMode', 'isDarkMode']);
  });
  'should parse names for code using nested hooks' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithNestedHooks' |> require(%)).Component;
    let InnerComponent;
    const hookNames = await (Component |> getHookNamesForComponent(%, {
      callback: innerComponent => {
        InnerComponent = innerComponent;
      }
    }));
    const innerHookNames = await (InnerComponent |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, ['InnerComponent']);
    innerHookNames |> expectHookNamesToEqual(%, ['state']);
  });
  // TODO Test that cache purge works

  // TODO Test that cached metadata is purged when Fast Refresh scheduled
  'should return null for custom hooks without explicit names' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithUnnamedCustomHooks' |> require(%)).Component;
    const hookNames = await (Component |> getHookNamesForComponent(%));
    hookNames |> expectHookNamesToEqual(%, [null,
    // Custom hooks can have names, but this one does not even return a value.
    null,
    // Custom hooks can have names, but not when using destructuring.
    null // Custom hooks can have names, but not when using destructuring.
    ]);
  });
  'inline, external and bundle source maps' |> describe(%, () => {
    'should work for simple components' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState
        ]);
      }
      await ('./__source__/Example' |> test(%)); // original source (uncompiled)
      await ('./__source__/__compiled__/inline/Example' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/Example' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/Example' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/Example' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle/index' |> test(%, 'Example')); // bundle source map
      await ('./__source__/__compiled__/no-columns/Example' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work with more complex files and components' |> it(%, async () => {
      async function test(path, name = undefined) {
        const components = name != null ? (path |> require(%))[name] : path |> require(%);
        let hookNames = await (components.List |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['newItemText',
        // useState
        'items',
        // useState
        'uid',
        // useState
        'handleClick',
        // useCallback
        'handleKeyPress',
        // useCallback
        'handleChange',
        // useCallback
        'removeItem',
        // useCallback
        'toggleItem' // useCallback
        ]);
        hookNames = await (components.ListItem |> getHookNamesForComponent(%, {
          item: {}
        }));
        hookNames |> expectHookNamesToEqual(%, ['handleDelete',
        // useCallback
        'handleToggle' // useCallback
        ]);
      }
      await ('./__source__/ToDoList' |> test(%)); // original source (uncompiled)
      await ('./__source__/__compiled__/inline/ToDoList' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ToDoList' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ToDoList' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ToDoList' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ToDoList')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ToDoList' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work for custom hook' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count',
        // useState()
        'isDarkMode',
        // useIsDarkMode()
        'isDarkMode',
        // useIsDarkMode -> useState()
        null // useFoo()
        ]);
      }
      await ('./__source__/ComponentWithCustomHook' |> test(%)); // original source (uncompiled)
      await ('./__source__/__compiled__/inline/ComponentWithCustomHook' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ComponentWithCustomHook' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ComponentWithCustomHook' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ComponentWithCustomHook' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ComponentWithCustomHook')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ComponentWithCustomHook' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work when code is using hooks indirectly' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count',
        // useState()
        'darkMode',
        // useDarkMode()
        'isDarkMode' // useState()
        ]);
      }
      await ('./__source__/__compiled__/inline/ComponentUsingHooksIndirectly' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ComponentUsingHooksIndirectly' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ComponentUsingHooksIndirectly' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ComponentUsingHooksIndirectly' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ComponentUsingHooksIndirectly')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ComponentUsingHooksIndirectly' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work when code is using nested hooks' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        let InnerComponent;
        const hookNames = await (Component |> getHookNamesForComponent(%, {
          callback: innerComponent => {
            InnerComponent = innerComponent;
          }
        }));
        const innerHookNames = await (InnerComponent |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['InnerComponent' // useMemo()
        ]);
        innerHookNames |> expectHookNamesToEqual(%, ['state' // useState()
        ]);
      }
      await ('./__source__/__compiled__/inline/ComponentWithNestedHooks' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ComponentWithNestedHooks' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ComponentWithNestedHooks' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ComponentWithNestedHooks' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ComponentWithNestedHooks')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ComponentWithNestedHooks' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work for external hooks' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['theme',
        // useTheme()
        'theme' // useContext()
        ]);
      }

      // We can't test the uncompiled source here, because it either needs to get transformed,
      // which would break the source mapping, or the import statements will fail.

      await ('./__source__/__compiled__/inline/ComponentWithExternalCustomHooks' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ComponentWithExternalCustomHooks' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ComponentWithExternalCustomHooks' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ComponentWithExternalCustomHooks' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ComponentWithExternalCustomHooks')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ComponentWithExternalCustomHooks' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    // TODO Inline require (e.g. require("react").useState()) isn't supported yet.
    // Maybe this isn't an important use case to support,
    // since inline requires are most likely to exist in compiled source (if at all).
    'should work when multiple hooks are on a line' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['a',
        // useContext()
        'b',
        // useContext()
        'c',
        // useContext()
        'd' // useContext()
        ]);
      }
      await ('./__source__/__compiled__/inline/ComponentWithMultipleHooksPerLine' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ComponentWithMultipleHooksPerLine' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ComponentWithMultipleHooksPerLine')); // bundle source map

      async function noColumnTest(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['a',
        // useContext()
        'b',
        // useContext()
        null,
        // useContext()
        null // useContext()
        ]);
      }

      // Note that this test is expected to only match the first two hooks
      // because the 3rd and 4th hook are on the same line,
      // and this type of source map doesn't have column numbers.
      await ('./__source__/__compiled__/no-columns/ComponentWithMultipleHooksPerLine' |> noColumnTest(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should work for inline requires' |> xit(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState()
        ]);
      }
      await ('./__source__/InlineRequire' |> test(%)); // original source (uncompiled)
      await ('./__source__/__compiled__/inline/InlineRequire' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/InlineRequire' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/InlineRequire' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/InlineRequire' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'InlineRequire')); // bundle source map
      await ('./__source__/__compiled__/no-columns/InlineRequire' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
    'should support sources that contain the string "sourceMappingURL="' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState()
        ]);
      }

      // We expect the inline sourceMappingURL to be invalid in this case; mute the warning.
      console.warn = () => {};
      await ('./__source__/ContainingStringSourceMappingURL' |> test(%)); // original source (uncompiled)
      await ('./__source__/__compiled__/inline/ContainingStringSourceMappingURL' |> test(%)); // inline source map
      await ('./__source__/__compiled__/external/ContainingStringSourceMappingURL' |> test(%)); // external source map
      await ('./__source__/__compiled__/inline/index-map/ContainingStringSourceMappingURL' |> test(%)); // inline index map source map
      await ('./__source__/__compiled__/external/index-map/ContainingStringSourceMappingURL' |> test(%)); // external index map source map
      await ('./__source__/__compiled__/bundle' |> test(%, 'ContainingStringSourceMappingURL')); // bundle source map
      await ('./__source__/__compiled__/no-columns/ContainingStringSourceMappingURL' |> test(%)); // simulated Webpack 'cheap-module-source-map'
    });
  });
  'extended source maps' |> describe(%, () => {
    (() => {
      const babelParser = '@babel/parser' |> require(%);
      const generateHookMapModule = '../generateHookMap' |> require(%);
      babelParser |> jest.spyOn(%, 'parse');
      generateHookMapModule |> jest.spyOn(%, 'decodeHookMap');
    }) |> beforeEach(%);
    'should work for simple components' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/Example' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/Example' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/Example' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/Example' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/Example' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/Example' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/Example' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/Example' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work with more complex files and components' |> it(%, async () => {
      async function test(path, name = undefined) {
        const components = name != null ? (path |> require(%))[name] : path |> require(%);
        let hookNames = await (components.List |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['newItemText',
        // useState
        'items',
        // useState
        'uid',
        // useState
        'handleClick',
        // useCallback
        'handleKeyPress',
        // useCallback
        'handleChange',
        // useCallback
        'removeItem',
        // useCallback
        'toggleItem' // useCallback
        ]);
        hookNames = await (components.ListItem |> getHookNamesForComponent(%, {
          item: {}
        }));
        hookNames |> expectHookNamesToEqual(%, ['handleDelete',
        // useCallback
        'handleToggle' // useCallback
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/ToDoList' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ToDoList' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ToDoList' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ToDoList' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ToDoList' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ToDoList' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ToDoList' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ToDoList' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work for custom hook' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count',
        // useState()
        'isDarkMode',
        // useIsDarkMode()
        'isDarkMode',
        // useIsDarkMode -> useState()
        null // isFoo()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/ComponentWithCustomHook' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ComponentWithCustomHook' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ComponentWithCustomHook' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ComponentWithCustomHook' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ComponentWithCustomHook' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ComponentWithCustomHook' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ComponentWithCustomHook' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ComponentWithCustomHook' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work when code is using hooks indirectly' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count',
        // useState()
        'darkMode',
        // useDarkMode()
        'isDarkMode' // useState()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/ComponentUsingHooksIndirectly' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ComponentUsingHooksIndirectly' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ComponentUsingHooksIndirectly' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ComponentUsingHooksIndirectly' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ComponentUsingHooksIndirectly' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ComponentUsingHooksIndirectly' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ComponentUsingHooksIndirectly' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ComponentUsingHooksIndirectly' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work when code is using nested hooks' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        let InnerComponent;
        const hookNames = await (Component |> getHookNamesForComponent(%, {
          callback: innerComponent => {
            InnerComponent = innerComponent;
          }
        }));
        const innerHookNames = await (InnerComponent |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['InnerComponent' // useMemo()
        ]);
        innerHookNames |> expectHookNamesToEqual(%, ['state' // useState()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/ComponentWithNestedHooks' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ComponentWithNestedHooks' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ComponentWithNestedHooks' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ComponentWithNestedHooks' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ComponentWithNestedHooks' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ComponentWithNestedHooks' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ComponentWithNestedHooks' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ComponentWithNestedHooks' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work for external hooks' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['theme',
        // useTheme()
        'theme' // useContext()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }

      // We can't test the uncompiled source here, because it either needs to get transformed,
      // which would break the source mapping, or the import statements will fail.

      await ('./__source__/__compiled__/inline/fb-sources-extended/ComponentWithExternalCustomHooks' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ComponentWithExternalCustomHooks' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ComponentWithExternalCustomHooks' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ComponentWithExternalCustomHooks' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ComponentWithExternalCustomHooks' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ComponentWithExternalCustomHooks' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ComponentWithExternalCustomHooks' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ComponentWithExternalCustomHooks' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    // TODO Inline require (e.g. require("react").useState()) isn't supported yet.
    // Maybe this isn't an important use case to support,
    // since inline requires are most likely to exist in compiled source (if at all).
    'should work when multiple hooks are on a line' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['a',
        // useContext()
        'b',
        // useContext()
        'c',
        // useContext()
        'd' // useContext()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/ComponentWithMultipleHooksPerLine' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ComponentWithMultipleHooksPerLine' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ComponentWithMultipleHooksPerLine' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ComponentWithMultipleHooksPerLine' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ComponentWithMultipleHooksPerLine' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should work for inline requires' |> xit(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }
      await ('./__source__/__compiled__/inline/fb-sources-extended/InlineRequire' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/InlineRequire' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/InlineRequire' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/InlineRequire' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/InlineRequire' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/InlineRequire' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/InlineRequire' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/InlineRequire' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
    'should support sources that contain the string "sourceMappingURL="' |> it(%, async () => {
      async function test(path, name = 'Component') {
        const Component = (path |> require(%))[name];
        const hookNames = await (Component |> getHookNamesForComponent(%));
        hookNames |> expectHookNamesToEqual(%, ['count' // useState()
        ]);
        0 |> (('@babel/parser' |> require(%)).parse |> expect(%)).toHaveBeenCalledTimes(%);
        (('../generateHookMap' |> require(%)).decodeHookMap |> expect(%)).toHaveBeenCalled();
      }

      // We expect the inline sourceMappingURL to be invalid in this case; mute the warning.
      console.warn = () => {};
      await ('./__source__/__compiled__/inline/fb-sources-extended/ContainingStringSourceMappingURL' |> test(%)); // x_facebook_sources extended inline source map
      await ('./__source__/__compiled__/external/fb-sources-extended/ContainingStringSourceMappingURL' |> test(%)); // x_facebook_sources extended external source map
      await ('./__source__/__compiled__/inline/react-sources-extended/ContainingStringSourceMappingURL' |> test(%)); // x_react_sources extended inline source map
      await ('./__source__/__compiled__/external/react-sources-extended/ContainingStringSourceMappingURL' |> test(%)); // x_react_sources extended external source map

      // Using index map format for source maps
      await ('./__source__/__compiled__/inline/fb-sources-extended/index-map/ContainingStringSourceMappingURL' |> test(%)); // x_facebook_sources extended inline index map source map
      await ('./__source__/__compiled__/external/fb-sources-extended/index-map/ContainingStringSourceMappingURL' |> test(%)); // x_facebook_sources extended external index map source map
      await ('./__source__/__compiled__/inline/react-sources-extended/index-map/ContainingStringSourceMappingURL' |> test(%)); // x_react_sources extended inline index map source map
      await ('./__source__/__compiled__/external/react-sources-extended/index-map/ContainingStringSourceMappingURL' |> test(%)); // x_react_sources extended external index map source map

      // TODO test no-columns and bundle cases with extended source maps
    });
  });
});
'parseHookNames worker' |> describe(%, () => {
  let inspectHooks;
  let parseHookNames;
  let workerizedParseSourceAndMetadataMock;
  (() => {
    window.Worker = undefined;
    workerizedParseSourceAndMetadataMock = jest.fn();
    initFetchMock();
    '../parseHookNames/parseSourceAndMetadata.worker.js' |> jest.mock(%, () => {
      return {
        __esModule: true,
        default: () => ({
          parseSourceAndMetadata: workerizedParseSourceAndMetadataMock
        })
      };
    });
    inspectHooks = ('react-debug-tools/src/ReactDebugHooks' |> require(%)).inspectHooks;
    parseHookNames = ('../parseHookNames' |> require(%)).parseHookNames;
  }) |> beforeEach(%);
  async function getHookNamesForComponent(Component, props = {}) {
    const hooksTree = inspectHooks(Component, props, undefined);
    const hookNames = await (hooksTree |> parseHookNames(%));
    return hookNames;
  }
  'should use worker' |> it(%, async () => {
    const Component = ('./__source__/__untransformed__/ComponentWithUseState' |> require(%)).Component;
    window.Worker = true;

    // Reset module so mocked worker instance can be updated.
    jest.resetModules();
    parseHookNames = ('../parseHookNames' |> require(%)).parseHookNames;
    await (Component |> getHookNamesForComponent(%));
    1 |> (workerizedParseSourceAndMetadataMock |> expect(%)).toHaveBeenCalledTimes(%);
  });
});