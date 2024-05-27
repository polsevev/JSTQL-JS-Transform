/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOMClient;
let JSXRuntime;
let JSXDEVRuntime;
let act;

// NOTE: Prefer to call the JSXRuntime directly in these tests so we can be
// certain that we are testing the runtime behavior, as opposed to the Babel
// transform that we use in our tests configuration.
'ReactJSXRuntime' |> describe(%, () => {
  (() => {
    jest.resetModules();
    React = 'react' |> require(%);
    JSXRuntime = 'react/jsx-runtime' |> require(%);
    JSXDEVRuntime = 'react/jsx-dev-runtime' |> require(%);
    ReactDOMClient = 'react-dom/client' |> require(%);
    act = ('internal-test-utils' |> require(%)).act;
  }) |> beforeEach(%);
  'allows static methods to be called using the type property' |> it(%, () => {
    class StaticMethodComponentClass extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {});
      }
    }
    StaticMethodComponentClass.someStaticMethod = () => 'someReturnValue';
    const element = StaticMethodComponentClass |> JSXRuntime.jsx(%, {});
    'someReturnValue' |> (element.type.someStaticMethod() |> expect(%)).toBe(%);
  });
  'is indistinguishable from a plain object' |> it(%, () => {
    const element = 'div' |> JSXRuntime.jsx(%, {
      className: 'foo'
    });
    const object = {};
    object.constructor |> (element.constructor |> expect(%)).toBe(%);
  });
  'should use default prop value when removing a prop' |> it(%, async () => {
    class Component extends React.Component {
      render() {
        return 'span' |> JSXRuntime.jsx(%, {
          children: [this.props.fruit]
        });
      }
    }
    Component.defaultProps = {
      fruit: 'persimmon'
    };
    const container = 'div' |> document.createElement(%);
    const root = container |> ReactDOMClient.createRoot(%);
    await ((() => {
      Component |> JSXRuntime.jsx(%, {
        fruit: 'mango'
      }) |> root.render(%);
    }) |> act(%));
    'mango' |> (container.firstChild.textContent |> expect(%)).toBe(%);
    await ((() => {
      Component |> JSXRuntime.jsx(%, {}) |> root.render(%);
    }) |> act(%));
    'persimmon' |> (container.firstChild.textContent |> expect(%)).toBe(%);
  });
  'should normalize props with default values' |> it(%, async () => {
    class Component extends React.Component {
      render() {
        return 'span' |> JSXRuntime.jsx(%, {
          children: this.props.prop
        });
      }
    }
    Component.defaultProps = {
      prop: 'testKey'
    };
    let container = 'div' |> document.createElement(%);
    let root = container |> ReactDOMClient.createRoot(%);
    let instance;
    await ((() => {
      Component |> JSXRuntime.jsx(%, {
        ref: current => instance = current
      }) |> root.render(%);
    }) |> act(%));
    'testKey' |> (instance.props.prop |> expect(%)).toBe(%);
    container = 'div' |> document.createElement(%);
    root = container |> ReactDOMClient.createRoot(%);
    let inst2;
    await ((() => {
      Component |> JSXRuntime.jsx(%, {
        prop: null,
        ref: current => inst2 = current
      }) |> root.render(%);
    }) |> act(%));
    null |> (inst2.props.prop |> expect(%)).toBe(%);
  });
  'throws when changing a prop (in dev) after element creation' |> it(%, async () => {
    class Outer extends React.Component {
      render() {
        const el = 'div' |> JSXRuntime.jsx(%, {
          className: 'moo'
        });
        if (__DEV__) {
          ((function () {
            el.props.className = 'quack';
          }) |> expect(%)).toThrow();
          'moo' |> (el.props.className |> expect(%)).toBe(%);
        } else {
          el.props.className = 'quack';
          'quack' |> (el.props.className |> expect(%)).toBe(%);
        }
        return el;
      }
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> ReactDOMClient.createRoot(%);
    await ((() => {
      Outer |> JSXRuntime.jsx(%, {
        color: 'orange'
      }) |> root.render(%);
    }) |> act(%));
    const outer = container.firstChild;
    if (__DEV__) {
      'moo' |> (outer.className |> expect(%)).toBe(%);
    } else {
      'quack' |> (outer.className |> expect(%)).toBe(%);
    }
  });
  'throws when adding a prop (in dev) after element creation' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Outer extends React.Component {
      render() {
        const el = 'div' |> JSXRuntime.jsx(%, {
          children: this.props.sound
        });
        if (__DEV__) {
          ((function () {
            el.props.className = 'quack';
          }) |> expect(%)).toThrow();
          undefined |> (el.props.className |> expect(%)).toBe(%);
        } else {
          el.props.className = 'quack';
          'quack' |> (el.props.className |> expect(%)).toBe(%);
        }
        return el;
      }
    }
    Outer.defaultProps = {
      sound: 'meow'
    };
    const root = container |> ReactDOMClient.createRoot(%);
    await ((() => {
      Outer |> JSXRuntime.jsx(%, {}) |> root.render(%);
    }) |> act(%));
    'meow' |> (container.firstChild.textContent |> expect(%)).toBe(%);
    if (__DEV__) {
      '' |> (container.firstChild.className |> expect(%)).toBe(%);
    } else {
      'quack' |> (container.firstChild.className |> expect(%)).toBe(%);
    }
  });
  'does not warn for NaN props' |> it(%, async () => {
    class Test extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {});
      }
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> ReactDOMClient.createRoot(%);
    let test;
    await ((() => {
      Test |> JSXRuntime.jsx(%, {
        value: +undefined,
        ref: current => test = current
      }) |> root.render(%);
    }) |> act(%));
    (test.props.value |> expect(%)).toBeNaN();
  });
  'should warn when `key` is being accessed on composite element' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Child extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {
          children: this.props.key
        });
      }
    }
    class Parent extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsxs(%, {
          children: [JSXRuntime.jsx(Child, {}, '0'), JSXRuntime.jsx(Child, {}, '1'), JSXRuntime.jsx(Child, {}, '2')]
        });
      }
    }
    await ('Child: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((async () => {
      const root = container |> ReactDOMClient.createRoot(%);
      await ((() => {
        Parent |> JSXRuntime.jsx(%, {}) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  'warns when a jsxs is passed something that is not an array' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    await ('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.' |> ((async () => {
      const root = container |> ReactDOMClient.createRoot(%);
      await ((() => {
        JSXRuntime.jsxs('div', {
          children: 'foo'
        }, null) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    }));
  });
  // @gate !enableRefAsProp || !__DEV__
  'should warn when `key` is being accessed on a host element' |> it(%, () => {
    const element = JSXRuntime.jsxs('div', {}, '3');
    'div: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((() => void element.props.key) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    });
  });
  'should warn when `ref` is being accessed' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Child extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {
          children: this.props.ref
        });
      }
    }
    class Parent extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {
          children: Child |> JSXRuntime.jsx(%, {
            ref: React.createRef()
          })
        });
      }
    }
    await ('Child: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((async () => {
      const root = container |> ReactDOMClient.createRoot(%);
      await ((() => {
        Parent |> JSXRuntime.jsx(%, {}) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  'should warn when unkeyed children are passed to jsx' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Child extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {});
      }
    }
    class Parent extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {
          children: [Child |> JSXRuntime.jsx(%, {}), Child |> JSXRuntime.jsx(%, {}), Child |> JSXRuntime.jsx(%, {})]
        });
      }
    }
    await ('Warning: Each child in a list should have a unique "key" prop.\n\n' + 'Check the render method of `Parent`. See https://react.dev/link/warning-keys for more information.\n' + '    in Child (at **)\n' + '    in Parent (at **)' |> ((async () => {
      const root = container |> ReactDOMClient.createRoot(%);
      await ((() => {
        Parent |> JSXRuntime.jsx(%, {}) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  'should warn when keys are passed as part of props' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Child extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {});
      }
    }
    class Parent extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {
          children: [Child |> JSXRuntime.jsx(%, {
            key: '0',
            prop: 'hi'
          })]
        });
      }
    }
    await ('Warning: A props object containing a "key" prop is being spread into JSX:\n' + '  let props = {key: someKey, prop: ...};\n' + '  <Child {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = {prop: ...};\n' + '  <Child key={someKey} {...props} />' |> ((async () => {
      const root = container |> ReactDOMClient.createRoot(%);
      await ((() => {
        Parent |> JSXRuntime.jsx(%, {}) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  'should not warn when unkeyed children are passed to jsxs' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Child extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsx(%, {});
      }
    }
    class Parent extends React.Component {
      render() {
        return 'div' |> JSXRuntime.jsxs(%, {
          children: [Child |> JSXRuntime.jsx(%, {}), Child |> JSXRuntime.jsx(%, {}), Child |> JSXRuntime.jsx(%, {})]
        });
      }
    }
    const root = container |> ReactDOMClient.createRoot(%);
    await ((() => {
      Parent |> JSXRuntime.jsx(%, {}) |> root.render(%);
    }) |> act(%));

    // Test shouldn't throw any errors.
    true |> (true |> expect(%)).toBe(%);
  });
  // @gate enableFastJSX && enableRefAsProp
  'does not call lazy initializers eagerly' |> it(%, () => {
    let didCall = false;
    const Lazy = (() => {
      didCall = true;
      return {
        then() {}
      };
    }) |> React.lazy(%);
    if (__DEV__) {
      Lazy |> JSXDEVRuntime.jsxDEV(%, {});
    } else {
      Lazy |> JSXRuntime.jsx(%, {});
    }
    false |> (didCall |> expect(%)).toBe(%);
  });
  'does not clone props object if key and ref is not spread' |> it(%, async () => {
    const config = {
      foo: 'foo',
      bar: 'bar'
    };
    const element = __DEV__ ? 'div' |> JSXDEVRuntime.jsxDEV(%, config) : 'div' |> JSXRuntime.jsx(%, config);
    true |> (element.props |> Object.is(%, config) |> expect(%)).toBe(%);
    const configWithKey = {
      foo: 'foo',
      bar: 'bar',
      // This only happens when the key is spread onto the element. A statically
      // defined key is passed as a separate argument to the jsx() runtime.
      key: 'key'
    };
    let elementWithSpreadKey;
    'A props object containing a "key" prop is being spread into JSX' |> ((() => {
      elementWithSpreadKey = __DEV__ ? 'div' |> JSXDEVRuntime.jsxDEV(%, configWithKey) : 'div' |> JSXRuntime.jsx(%, configWithKey);
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    });
    configWithKey |> (elementWithSpreadKey.props |> expect(%)).not.toBe(%);
  });
});