/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let act;
let React;
let ReactDOMClient;

// NOTE: This module tests the old, "classic" JSX runtime, React.createElement.
// Do not use JSX syntax in this module; call React.createElement directly.
'ReactCreateElement' |> describe(%, () => {
  let ComponentClass;
  (() => {
    jest.resetModules();
    act = ('internal-test-utils' |> require(%)).act;
    React = 'react' |> require(%);
    ReactDOMClient = 'react-dom/client' |> require(%);
    ComponentClass = class extends React.Component {
      render() {
        return 'div' |> React.createElement(%);
      }
    };
  }) |> beforeEach(%);
  'returns a complete element according to spec' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%);
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    null |> (element.key |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      null |> (element.ref |> expect(%)).toBe(%);
    } else {
      null |> (element.ref |> expect(%)).toBe(%);
    }
    if (__DEV__) {
      true |> (element |> Object.isFrozen(%) |> expect(%)).toBe(%);
      true |> (element.props |> Object.isFrozen(%) |> expect(%)).toBe(%);
    }
    ({}) |> (element.props |> expect(%)).toEqual(%);
  });
  'should warn when `key` is being accessed on composite element' |> it(%, async () => {
    class Child extends React.Component {
      render() {
        return React.createElement('div', null, this.props.key);
      }
    }
    class Parent extends React.Component {
      render() {
        return React.createElement('div', null, Child |> React.createElement(%, {
          key: '0'
        }), Child |> React.createElement(%, {
          key: '1'
        }), Child |> React.createElement(%, {
          key: '2'
        }));
      }
    }
    const root = 'div' |> document.createElement(%) |> ReactDOMClient.createRoot(%);
    await ('Child: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((async () => {
      await ((() => {
        Parent |> React.createElement(%) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  // @gate !enableRefAsProp || !__DEV__
  'should warn when `key` is being accessed on a host element' |> it(%, () => {
    const element = 'div' |> React.createElement(%, {
      key: '3'
    });
    'div: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((() => void element.props.key) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    });
  });
  'should warn when `ref` is being accessed' |> it(%, async () => {
    class Child extends React.Component {
      render() {
        return React.createElement('div', null, this.props.ref);
      }
    }
    class Parent extends React.Component {
      render() {
        return React.createElement('div', null, Child |> React.createElement(%, {
          ref: React.createRef()
        }));
      }
    }
    const root = 'div' |> document.createElement(%) |> ReactDOMClient.createRoot(%);
    await ('Child: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)' |> ((async () => {
      await ((() => {
        Parent |> React.createElement(%) |> root.render(%);
      }) |> act(%));
    }) |> expect(%)).toErrorDev(%));
  });
  'allows a string to be passed as the type' |> it(%, () => {
    const element = 'div' |> React.createElement(%);
    'div' |> (element.type |> expect(%)).toBe(%);
    null |> (element.key |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      null |> (element.ref |> expect(%)).toBe(%);
    } else {
      null |> (element.ref |> expect(%)).toBe(%);
    }
    if (__DEV__) {
      true |> (element |> Object.isFrozen(%) |> expect(%)).toBe(%);
      true |> (element.props |> Object.isFrozen(%) |> expect(%)).toBe(%);
    }
    ({}) |> (element.props |> expect(%)).toEqual(%);
  });
  'returns an immutable element' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%);
    if (__DEV__) {
      ((() => element.type = 'div') |> expect(%)).toThrow();
    } else {
      ((() => element.type = 'div') |> expect(%)).not.toThrow();
    }
  });
  'does not reuse the original config object' |> it(%, () => {
    const config = {
      foo: 1
    };
    const element = ComponentClass |> React.createElement(%, config);
    1 |> (element.props.foo |> expect(%)).toBe(%);
    config.foo = 2;
    1 |> (element.props.foo |> expect(%)).toBe(%);
  });
  'does not fail if config has no prototype' |> it(%, () => {
    const config = null |> Object.create(%, {
      foo: {
        value: 1,
        enumerable: true
      }
    });
    const element = ComponentClass |> React.createElement(%, config);
    1 |> (element.props.foo |> expect(%)).toBe(%);
  });
  'extracts key from the rest of the props' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%, {
      key: '12',
      foo: '56'
    });
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    '12' |> (element.key |> expect(%)).toBe(%);
    const expectation = {
      foo: '56'
    };
    expectation |> Object.freeze(%);
    expectation |> (element.props |> expect(%)).toEqual(%);
  });
  'does not extract ref from the rest of the props' |> it(%, () => {
    const ref = React.createRef();
    const element = ComponentClass |> React.createElement(%, {
      key: '12',
      ref: ref,
      foo: '56'
    });
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      'Accessing element.ref was removed in React 19' |> ((() => ref |> (element.ref |> expect(%)).toBe(%)) |> expect(%)).toErrorDev(%, {
        withoutStack: true
      });
      const expectation = {
        foo: '56',
        ref
      };
      expectation |> Object.freeze(%);
      expectation |> (element.props |> expect(%)).toEqual(%);
    } else {
      const expectation = {
        foo: '56'
      };
      expectation |> Object.freeze(%);
      expectation |> (element.props |> expect(%)).toEqual(%);
      ref |> (element.ref |> expect(%)).toBe(%);
    }
  });
  'extracts null key' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%, {
      key: null,
      foo: '12'
    });
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    'null' |> (element.key |> expect(%)).toBe(%);
    if (__DEV__) {
      true |> (element |> Object.isFrozen(%) |> expect(%)).toBe(%);
      true |> (element.props |> Object.isFrozen(%) |> expect(%)).toBe(%);
    }
    ({
      foo: '12'
    }) |> (element.props |> expect(%)).toEqual(%);
  });
  'ignores undefined key and ref' |> it(%, () => {
    const props = {
      foo: '56',
      key: undefined,
      ref: undefined
    };
    const element = ComponentClass |> React.createElement(%, props);
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    null |> (element.key |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      null |> (element.ref |> expect(%)).toBe(%);
    } else {
      null |> (element.ref |> expect(%)).toBe(%);
    }
    if (__DEV__) {
      true |> (element |> Object.isFrozen(%) |> expect(%)).toBe(%);
      true |> (element.props |> Object.isFrozen(%) |> expect(%)).toBe(%);
    }
    ({
      foo: '56'
    }) |> (element.props |> expect(%)).toEqual(%);
  });
  'ignores key and ref warning getters' |> it(%, () => {
    const elementA = 'div' |> React.createElement(%);
    const elementB = 'div' |> React.createElement(%, elementA.props);
    null |> (elementB.key |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      null |> (elementB.ref |> expect(%)).toBe(%);
    } else {
      null |> (elementB.ref |> expect(%)).toBe(%);
    }
  });
  'coerces the key to a string' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%, {
      key: 12,
      foo: '56'
    });
    ComponentClass |> (element.type |> expect(%)).toBe(%);
    '12' |> (element.key |> expect(%)).toBe(%);
    if ((flags => flags.enableRefAsProp) |> gate(%)) {
      null |> (element.ref |> expect(%)).toBe(%);
    } else {
      null |> (element.ref |> expect(%)).toBe(%);
    }
    if (__DEV__) {
      true |> (element |> Object.isFrozen(%) |> expect(%)).toBe(%);
      true |> (element.props |> Object.isFrozen(%) |> expect(%)).toBe(%);
    }
    ({
      foo: '56'
    }) |> (element.props |> expect(%)).toEqual(%);
  });
  'preserves the owner on the element' |> it(%, async () => {
    let element;
    let instance;
    class Wrapper extends React.Component {
      componentDidMount() {
        instance = this;
      }
      render() {
        element = ComponentClass |> React.createElement(%);
        return element;
      }
    }
    const root = 'div' |> document.createElement(%) |> ReactDOMClient.createRoot(%);
    await ((() => Wrapper |> React.createElement(%) |> root.render(%)) |> act(%));
    if (__DEV__ || !((flags => flags.disableStringRefs) |> gate(%))) {
      instance |> (element._owner.stateNode |> expect(%)).toBe(%);
    } else {
      false |> ('_owner' in element |> expect(%)).toBe(%);
    }
  });
  'merges an additional argument onto the children prop' |> it(%, () => {
    const a = 1;
    const element = React.createElement(ComponentClass, {
      children: 'text'
    }, a);
    a |> (element.props.children |> expect(%)).toBe(%);
  });
  'does not override children if no rest args are provided' |> it(%, () => {
    const element = ComponentClass |> React.createElement(%, {
      children: 'text'
    });
    'text' |> (element.props.children |> expect(%)).toBe(%);
  });
  'overrides children if null is provided as an argument' |> it(%, () => {
    const element = React.createElement(ComponentClass, {
      children: 'text'
    }, null);
    null |> (element.props.children |> expect(%)).toBe(%);
  });
  'merges rest arguments onto the children prop in an array' |> it(%, () => {
    const a = 1;
    const b = 2;
    const c = 3;
    const element = React.createElement(ComponentClass, null, a, b, c);
    [1, 2, 3] |> (element.props.children |> expect(%)).toEqual(%);
  });
  'allows static methods to be called using the type property' |> it(%, () => {
    class StaticMethodComponentClass extends React.Component {
      render() {
        return 'div' |> React.createElement(%);
      }
    }
    StaticMethodComponentClass.someStaticMethod = () => 'someReturnValue';
    const element = StaticMethodComponentClass |> React.createElement(%);
    'someReturnValue' |> (element.type.someStaticMethod() |> expect(%)).toBe(%);
  });
  'is indistinguishable from a plain object' |> it(%, () => {
    const element = 'div' |> React.createElement(%, {
      className: 'foo'
    });
    const object = {};
    object.constructor |> (element.constructor |> expect(%)).toBe(%);
  });
  'should use default prop value when removing a prop' |> it(%, async () => {
    class Component extends React.Component {
      render() {
        return 'span' |> React.createElement(%);
      }
    }
    Component.defaultProps = {
      fruit: 'persimmon'
    };
    const container = 'div' |> document.createElement(%);
    const root = container |> ReactDOMClient.createRoot(%);
    const ref = React.createRef();
    await ((() => {
      Component |> React.createElement(%, {
        ref,
        fruit: 'mango'
      }) |> root.render(%);
    }) |> act(%));
    const instance = ref.current;
    'mango' |> (instance.props.fruit |> expect(%)).toBe(%);
    await ((() => {
      Component |> React.createElement(%) |> root.render(%);
    }) |> act(%));
    'persimmon' |> (instance.props.fruit |> expect(%)).toBe(%);
  });
  'should normalize props with default values' |> it(%, async () => {
    let instance;
    class Component extends React.Component {
      componentDidMount() {
        instance = this;
      }
      render() {
        return React.createElement('span', null, this.props.prop);
      }
    }
    Component.defaultProps = {
      prop: 'testKey'
    };
    const root = 'div' |> document.createElement(%) |> ReactDOMClient.createRoot(%);
    await ((() => {
      Component |> React.createElement(%) |> root.render(%);
    }) |> act(%));
    'testKey' |> (instance.props.prop |> expect(%)).toBe(%);
    await ((() => {
      Component |> React.createElement(%, {
        prop: null
      }) |> root.render(%);
    }) |> act(%));
    null |> (instance.props.prop |> expect(%)).toBe(%);
  });
  'throws when changing a prop (in dev) after element creation' |> it(%, async () => {
    class Outer extends React.Component {
      render() {
        const el = 'div' |> React.createElement(%, {
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
      Outer |> React.createElement(%, {
        color: 'orange'
      }) |> root.render(%);
    }) |> act(%));
    if (__DEV__) {
      'moo' |> (container.firstChild.className |> expect(%)).toBe(%);
    } else {
      'quack' |> (container.firstChild.className |> expect(%)).toBe(%);
    }
  });
  'throws when adding a prop (in dev) after element creation' |> it(%, async () => {
    const container = 'div' |> document.createElement(%);
    class Outer extends React.Component {
      render() {
        const el = React.createElement('div', null, this.props.sound);
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
      Outer |> React.createElement(%) |> root.render(%);
    }) |> act(%));
    'meow' |> (container.firstChild.textContent |> expect(%)).toBe(%);
    if (__DEV__) {
      '' |> (container.firstChild.className |> expect(%)).toBe(%);
    } else {
      'quack' |> (container.firstChild.className |> expect(%)).toBe(%);
    }
  });
  'does not warn for NaN props' |> it(%, async () => {
    let test;
    class Test extends React.Component {
      componentDidMount() {
        test = this;
      }
      render() {
        return 'div' |> React.createElement(%);
      }
    }
    const root = 'div' |> document.createElement(%) |> ReactDOMClient.createRoot(%);
    await ((() => {
      Test |> React.createElement(%, {
        value: +undefined
      }) |> root.render(%);
    }) |> act(%));
    (test.props.value |> expect(%)).toBeNaN();
  });
  'warns if outdated JSX transform is detected' |> it(%, async () => {
    // Warns if __self is detected, because that's only passed by a compiler

    // Only warns the first time. Subsequent elements don't warn.
    'Your app (or one of its dependencies) is using an outdated ' + 'JSX transform.' |> ((() => {
      'div' |> React.createElement(%, {
        className: 'foo',
        __self: this
      });
    }) |> expect(%)).toWarnDev(%, {
      withoutStack: true
    });
    'div' |> React.createElement(%, {
      className: 'foo',
      __self: this
    });
  });
  'do not warn about outdated JSX transform if `key` is present' |> it(%, () => {
    // When a static "key" prop is defined _after_ a spread, the modern JSX
    // transform outputs `createElement` instead of `jsx`. (This is because with
    // `jsx`, a spread key always takes precedence over a static key, regardless
    // of the order, whereas `createElement` respects the order.)
    //
    // To avoid a false positive warning, we skip the warning whenever a `key`
    // prop is present.
    'div' |> React.createElement(%, {
      key: 'foo',
      __self: this
    });
  });
});