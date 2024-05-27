/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let useSyncExternalStore;
let useSyncExternalStoreWithSelector;
let React;
let ReactDOM;
let ReactDOMClient;
let Scheduler;
let act;
let useState;
let useEffect;
let useLayoutEffect;
let assertLog;
let originalError;

// This tests shared behavior between the built-in and shim implementations of
// of useSyncExternalStore.
'Shared useSyncExternalStore behavior (shim and built-in)' |> describe(%, () => {
  (() => {
    jest.resetModules();
    if ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%)) {
      // Test the shim against React 17.
      'react' |> jest.mock(%, () => {
        return (__DEV__ ? 'react-17/umd/react.development.js' : 'react-17/umd/react.production.min.js') |> jest.requireActual(%);
      });
      // Because React 17 prints extra logs we need to ignore them.
      'react-dom' |> jest.mock(%, () => (__DEV__ ? 'react-dom-17/umd/react-dom.development.js' : 'react-dom-17/umd/react-dom.production.min.js') |> jest.requireActual(%));
      originalError = console.error;
      console.error = jest.fn();
    }
    React = 'react' |> require(%);
    ReactDOM = 'react-dom' |> require(%);
    ReactDOMClient = 'react-dom/client' |> require(%);
    Scheduler = 'scheduler' |> require(%);
    useState = React.useState;
    useEffect = React.useEffect;
    useLayoutEffect = React.useLayoutEffect;
    const InternalTestUtils = 'internal-test-utils' |> require(%);
    assertLog = InternalTestUtils.assertLog;
    const internalAct = ('internal-test-utils' |> require(%)).act;

    // The internal act implementation doesn't batch updates by default, since
    // it's mostly used to test concurrent mode. But since these tests run
    // in both concurrent and legacy mode, I'm adding batching here.
    act = cb => (() => cb |> ReactDOM.unstable_batchedUpdates(%)) |> internalAct(%);
    if ((flags => flags.source) |> gate(%)) {
      // The `shim/with-selector` module composes the main
      // `use-sync-external-store` entrypoint. In the compiled artifacts, this
      // is resolved to the `shim` implementation by our build config, but when
      // running the tests against the source files, we need to tell Jest how to
      // resolve it. Because this is a source module, this mock has no affect on
      // the build tests.
      'use-sync-external-store/src/useSyncExternalStore' |> jest.mock(%, () => 'use-sync-external-store/shim' |> jest.requireActual(%));
    }
    useSyncExternalStore = ('use-sync-external-store/shim' |> require(%)).useSyncExternalStore;
    useSyncExternalStoreWithSelector = ('use-sync-external-store/shim/with-selector' |> require(%)).useSyncExternalStoreWithSelector;
  }) |> beforeEach(%);
  (() => {
    if ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%)) {
      console.error = originalError;
    }
  }) |> afterEach(%);
  function Text({
    text
  }) {
    text |> Scheduler.log(%);
    return text;
  }
  function createRoot(container) {
    // This wrapper function exists so we can test both legacy roots and
    // concurrent roots.
    if ((flags => !flags.enableUseSyncExternalStoreShim) |> gate(%)) {
      // The native implementation only exists in 18+, so we test using
      // concurrent mode. To test the legacy root behavior in the native
      // implementation (which is supported in the sense that it needs to have
      // the correct behavior, despite the fact that the legacy root API
      // triggers a warning in 18), write a test that uses
      // createLegacyRoot directly.
      return container |> ReactDOMClient.createRoot(%);
    } else {
      // This ReactDOM.render is from the React 17 npm module.
      null |> ReactDOM.render(%, container);
      return {
        render(children) {
          children |> ReactDOM.render(%, container);
        }
      };
    }
  }
  function createExternalStore(initialState) {
    const listeners = new Set();
    let currentState = initialState;
    return {
      set(text) {
        currentState = text;
        (() => {
          (listener => listener()) |> listeners.forEach(%);
        }) |> ReactDOM.unstable_batchedUpdates(%);
      },
      subscribe(listener) {
        listener |> listeners.add(%);
        return () => listener |> listeners.delete(%);
      },
      getState() {
        return currentState;
      },
      getSubscriberCount() {
        return listeners.size;
      }
    };
  }
  'basic usage' |> it(%, async () => {
    const store = 'Initial' |> createExternalStore(%);
    function App() {
      const text = store.subscribe |> useSyncExternalStore(%, store.getState);
      return Text |> React.createElement(%, {
        text: text
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['Initial'] |> assertLog(%);
    'Initial' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      'Updated' |> store.set(%);
    }) |> act(%));
    ['Updated'] |> assertLog(%);
    'Updated' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'skips re-rendering if nothing changes' |> it(%, async () => {
    const store = 'Initial' |> createExternalStore(%);
    function App() {
      const text = store.subscribe |> useSyncExternalStore(%, store.getState);
      return Text |> React.createElement(%, {
        text: text
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['Initial'] |> assertLog(%);
    // Update to the same value
    'Initial' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      'Initial' |> store.set(%);
    }) |> act(%));
    // Should not re-render
    [] |> assertLog(%);
    'Initial' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'switch to a different store' |> it(%, async () => {
    const storeA = 0 |> createExternalStore(%);
    const storeB = 0 |> createExternalStore(%);
    let setStore;
    function App() {
      const [store, _setStore] = storeA |> useState(%);
      setStore = _setStore;
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      return Text |> React.createElement(%, {
        text: value
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    [0] |> assertLog(%);
    '0' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      1 |> storeA.set(%);
    }) |> act(%));
    [1] |> assertLog(%);
    // Switch stores and update in the same batch
    '1' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      (() => {
        // This update will be disregarded
        2 |> storeA.set(%);
        storeB |> setStore(%);
      }) |> ReactDOM.flushSync(%);
    }) |> act(%));
    // Now reading from B instead of A
    [0] |> assertLog(%);
    // Update A
    '0' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      3 |> storeA.set(%);
    }) |> act(%));
    // Nothing happened, because we're no longer subscribed to A
    [] |> assertLog(%);
    // Update B
    '0' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      1 |> storeB.set(%);
    }) |> act(%));
    [1] |> assertLog(%);
    '1' |> (container.textContent |> expect(%)).toEqual(%);
  });
  // In React 18, you can't observe in between a sync render and its
  // passive effects, so this is only relevant to legacy roots
  // @gate enableUseSyncExternalStoreShim
  'selecting a specific value inside getSnapshot' |> it(%, async () => {
    const store = {
      a: 0,
      b: 0
    } |> createExternalStore(%);
    function A() {
      const a = store.subscribe |> useSyncExternalStore(%, () => store.getState().a);
      return Text |> React.createElement(%, {
        text: 'A' + a
      });
    }
    function B() {
      const b = store.subscribe |> useSyncExternalStore(%, () => store.getState().b);
      return Text |> React.createElement(%, {
        text: 'B' + b
      });
    }
    function App() {
      return React.createElement(React.Fragment, null, A |> React.createElement(%, null), B |> React.createElement(%, null));
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['A0', 'B0'] |> assertLog(%);
    // Update b but not a
    'A0B0' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      ({
        a: 0,
        b: 1
      }) |> store.set(%);
    }) |> act(%));
    // Only b re-renders
    ['B1'] |> assertLog(%);
    // Update a but not b
    'A0B1' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      ({
        a: 1,
        b: 1
      }) |> store.set(%);
    }) |> act(%));
    // Only a re-renders
    ['A1'] |> assertLog(%);
    'A1B1' |> (container.textContent |> expect(%)).toEqual(%);
  });
  "compares to current state before bailing out, even when there's a " + 'mutation in between the sync and passive effects' |> it(%, async () => {
    const store = 0 |> createExternalStore(%);
    function App() {
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      (() => {
        'Passive effect: ' + value |> Scheduler.log(%);
      }) |> useEffect(%, [value]);
      return Text |> React.createElement(%, {
        text: value
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    // Schedule an update. We'll intentionally not use `act` so that we can
    // insert a mutation before React subscribes to the store in a
    // passive effect.
    [0, 'Passive effect: 0'] |> assertLog(%);
    1 |> store.set(%);
    [1
    // Passive effect hasn't fired yet
    ] |> assertLog(%);
    // Flip the store state back to the previous value.
    '1' |> (container.textContent |> expect(%)).toEqual(%);
    0 |> store.set(%);
    // Should flip back to 0
    ['Passive effect: 1',
    // Re-render. If the current state were tracked by updating a ref in a
    // passive effect, then this would break because the previous render's
    // passive effect hasn't fired yet, so we'd incorrectly think that
    // the state hasn't changed.
    0] |> assertLog(%);
    '0' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'mutating the store in between render and commit when getSnapshot has changed' |> it(%, async () => {
    const store = {
      a: 1,
      b: 1
    } |> createExternalStore(%);
    const getSnapshotA = () => store.getState().a;
    const getSnapshotB = () => store.getState().b;
    function Child1({
      step
    }) {
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      (() => {
        if (step === 1) {
          // Update B in a layout effect. This happens in the same commit
          // that changed the getSnapshot in Child2. Child2's effects haven't
          // fired yet, so it doesn't have access to the latest getSnapshot. So
          // it can't use the getSnapshot to bail out.
          'Update B in commit phase' |> Scheduler.log(%);
          ({
            a: value.a,
            b: 2
          }) |> store.set(%);
        }
      }) |> useLayoutEffect(%, [step]);
      return null;
    }
    function Child2({
      step
    }) {
      const label = step === 0 ? 'A' : 'B';
      const getSnapshot = step === 0 ? getSnapshotA : getSnapshotB;
      const value = store.subscribe |> useSyncExternalStore(%, getSnapshot);
      return Text |> React.createElement(%, {
        text: label + value
      });
    }
    let setStep;
    function App() {
      const [step, _setStep] = 0 |> useState(%);
      setStep = _setStep;
      return React.createElement(React.Fragment, null, Child1 |> React.createElement(%, {
        step: step
      }), Child2 |> React.createElement(%, {
        step: step
      }));
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['A1'] |> assertLog(%);
    'A1' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      // Change getSnapshot and update the store in the same batch
      1 |> setStep(%);
    }) |> act(%));
    ['B1', 'Update B in commit phase',
    // If Child2 had used the old getSnapshot to bail out, then it would have
    // incorrectly bailed out here instead of re-rendering.
    'B2'] |> assertLog(%);
    'B2' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'mutating the store in between render and commit when getSnapshot has _not_ changed' |> it(%, async () => {
    // Same as previous test, but `getSnapshot` does not change
    const store = {
      a: 1,
      b: 1
    } |> createExternalStore(%);
    const getSnapshotA = () => store.getState().a;
    function Child1({
      step
    }) {
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      (() => {
        if (step === 1) {
          // Update B in a layout effect. This happens in the same commit
          // that changed the getSnapshot in Child2. Child2's effects haven't
          // fired yet, so it doesn't have access to the latest getSnapshot. So
          // it can't use the getSnapshot to bail out.
          'Update B in commit phase' |> Scheduler.log(%);
          ({
            a: value.a,
            b: 2
          }) |> store.set(%);
        }
      }) |> useLayoutEffect(%, [step]);
      return null;
    }
    function Child2({
      step
    }) {
      const value = store.subscribe |> useSyncExternalStore(%, getSnapshotA);
      return Text |> React.createElement(%, {
        text: 'A' + value
      });
    }
    let setStep;
    function App() {
      const [step, _setStep] = 0 |> useState(%);
      setStep = _setStep;
      return React.createElement(React.Fragment, null, Child1 |> React.createElement(%, {
        step: step
      }), Child2 |> React.createElement(%, {
        step: step
      }));
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['A1'] |> assertLog(%);
    // This will cause a layout effect, and in the layout effect we'll update
    // the store
    'A1' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      1 |> setStep(%);
    }) |> act(%));
    ['A1',
    // This updates B, but since Child2 doesn't subscribe to B, it doesn't
    // need to re-render.
    'Update B in commit phase'
    // No re-render
    ] |> assertLog(%);
    'A1' |> (container.textContent |> expect(%)).toEqual(%);
  });
  "does not bail out if the previous update hasn't finished yet" |> it(%, async () => {
    const store = 0 |> createExternalStore(%);
    function Child1() {
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      (() => {
        if (value === 1) {
          'Reset back to 0' |> Scheduler.log(%);
          0 |> store.set(%);
        }
      }) |> useLayoutEffect(%, [value]);
      return Text |> React.createElement(%, {
        text: value
      });
    }
    function Child2() {
      const value = store.subscribe |> useSyncExternalStore(%, store.getState);
      return Text |> React.createElement(%, {
        text: value
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => React.createElement(React.Fragment, null, Child1 |> React.createElement(%, null), Child2 |> React.createElement(%, null)) |> root.render(%)) |> act(%));
    [0, 0] |> assertLog(%);
    '00' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      1 |> store.set(%);
    }) |> act(%));
    [1, 1, 'Reset back to 0', 0, 0] |> assertLog(%);
    '00' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'uses the latest getSnapshot, even if it changed in the same batch as a store update' |> it(%, async () => {
    const store = {
      a: 0,
      b: 0
    } |> createExternalStore(%);
    const getSnapshotA = () => store.getState().a;
    const getSnapshotB = () => store.getState().b;
    let setGetSnapshot;
    function App() {
      const [getSnapshot, _setGetSnapshot] = (() => getSnapshotA) |> useState(%);
      setGetSnapshot = _setGetSnapshot;
      const text = store.subscribe |> useSyncExternalStore(%, getSnapshot);
      return Text |> React.createElement(%, {
        text: text
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    // Update the store and getSnapshot at the same time
    [0] |> assertLog(%);
    await ((() => {
      (() => {
        (() => getSnapshotB) |> setGetSnapshot(%);
        ({
          a: 1,
          b: 2
        }) |> store.set(%);
      }) |> ReactDOM.flushSync(%);
    }) |> act(%));
    // It should read from B instead of A
    [2] |> assertLog(%);
    '2' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'handles errors thrown by getSnapshot' |> it(%, async () => {
    class ErrorBoundary extends React.Component {
      state = {
        error: null
      };
      static getDerivedStateFromError(error) {
        return {
          error
        };
      }
      render() {
        if (this.state.error) {
          return Text |> React.createElement(%, {
            text: this.state.error.message
          });
        }
        return this.props.children;
      }
    }
    const store = {
      value: 0,
      throwInGetSnapshot: false,
      throwInIsEqual: false
    } |> createExternalStore(%);
    function App() {
      const {
        value
      } = store.subscribe |> useSyncExternalStore(%, () => {
        const state = store.getState();
        if (state.throwInGetSnapshot) {
          throw new Error('Error in getSnapshot');
        }
        return state;
      });
      return Text |> React.createElement(%, {
        text: value
      });
    }
    const errorBoundary = null |> React.createRef(%);
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => React.createElement(ErrorBoundary, {
      ref: errorBoundary
    }, App |> React.createElement(%, null)) |> root.render(%)) |> act(%));
    [0] |> assertLog(%);
    // Update that throws in a getSnapshot. We can catch it with an error boundary.
    '0' |> (container.textContent |> expect(%)).toEqual(%);
    if (__DEV__ && ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%))) {
      // In 17, the error is re-thrown in DEV.
      await ('Error in getSnapshot' |> ((async () => {
        await ((() => {
          ({
            value: 1,
            throwInGetSnapshot: true,
            throwInIsEqual: false
          }) |> store.set(%);
        }) |> act(%));
      }) |> expect(%)).rejects.toThrow(%));
    } else {
      await ((() => {
        ({
          value: 1,
          throwInGetSnapshot: true,
          throwInIsEqual: false
        }) |> store.set(%);
      }) |> act(%));
    }
    ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%) ? ['Error in getSnapshot'] : ['Error in getSnapshot',
    // In a concurrent root, React renders a second time to attempt to
    // recover from the error.
    'Error in getSnapshot']) |> assertLog(%);
    'Error in getSnapshot' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'Infinite loop if getSnapshot keeps returning new reference' |> it(%, async () => {
    const store = {} |> createExternalStore(%);
    function App() {
      const text = store.subscribe |> useSyncExternalStore(%, () => ({}));
      return Text |> React.createElement(%, {
        text: text |> JSON.stringify(%)
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await (((flags => flags.enableUseSyncExternalStoreShim) |> gate(%) ? ['Maximum update depth exceeded. ', 'The result of getSnapshot should be cached to avoid an infinite loop', 'The above error occurred in the'] : ['The result of getSnapshot should be cached to avoid an infinite loop']) |> ((async () => {
      await ('Maximum update depth exceeded. This can happen when a component repeatedly ' + 'calls setState inside componentWillUpdate or componentDidUpdate. React limits ' + 'the number of nested updates to prevent infinite loops.' |> ((async () => {
        await ((() => {
          (async () => App |> React.createElement(%, null) |> root.render(%)) |> ReactDOM.flushSync(%);
        }) |> act(%));
      }) |> expect(%)).rejects.toThrow(%));
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: (flags => {
        if (flags.enableUseSyncExternalStoreShim) {
          // Stacks don't work when mixing the source and the npm package.
          return flags.source ? 1 : 0;
        }
        return false;
      }) |> gate(%)
    }));
  });
  'getSnapshot can return NaN without infinite loop warning' |> it(%, async () => {
    const store = 'not a number' |> createExternalStore(%);
    function App() {
      const value = store.subscribe |> useSyncExternalStore(%, () => store.getState() |> parseInt(%, 10));
      return Text |> React.createElement(%, {
        text: value
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);

    // Initial render that reads a snapshot of NaN. This is OK because we use
    // Object.is algorithm to compare values.
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    'NaN' |> (container.textContent |> expect(%)).toEqual(%);
    // Update to real number
    [NaN] |> assertLog(%);
    await ((() => 123 |> store.set(%)) |> act(%));
    '123' |> (container.textContent |> expect(%)).toEqual(%);
    // Update back to NaN
    [123] |> assertLog(%);
    await ((() => 'not a number' |> store.set(%)) |> act(%));
    'NaN' |> (container.textContent |> expect(%)).toEqual(%);
    [NaN] |> assertLog(%);
  });
  'extra features implemented in user-space' |> describe(%, () => {
    'memoized selectors are only called once per update' |> it(%, async () => {
      const store = {
        a: 0,
        b: 0
      } |> createExternalStore(%);
      function selector(state) {
        'Selector' |> Scheduler.log(%);
        return state.a;
      }
      function App() {
        'App' |> Scheduler.log(%);
        const a = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, selector);
        return Text |> React.createElement(%, {
          text: 'A' + a
        });
      }
      const container = 'div' |> document.createElement(%);
      const root = container |> createRoot(%);
      await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
      ['App', 'Selector', 'A0'] |> assertLog(%);
      // Update the store
      'A0' |> (container.textContent |> expect(%)).toEqual(%);
      await ((() => {
        ({
          a: 1,
          b: 0
        }) |> store.set(%);
      }) |> act(%));
      [
      // The selector runs before React starts rendering
      'Selector', 'App',
      // And because the selector didn't change during render, we can reuse
      // the previous result without running the selector again
      'A1'] |> assertLog(%);
      'A1' |> (container.textContent |> expect(%)).toEqual(%);
    });
    'Using isEqual to bailout' |> it(%, async () => {
      const store = {
        a: 0,
        b: 0
      } |> createExternalStore(%);
      function A() {
        const {
          a
        } = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, state => ({
          a: state.a
        }), (state1, state2) => state1.a === state2.a);
        return Text |> React.createElement(%, {
          text: 'A' + a
        });
      }
      function B() {
        const {
          b
        } = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, state => {
          return {
            b: state.b
          };
        }, (state1, state2) => state1.b === state2.b);
        return Text |> React.createElement(%, {
          text: 'B' + b
        });
      }
      function App() {
        return React.createElement(React.Fragment, null, A |> React.createElement(%, null), B |> React.createElement(%, null));
      }
      const container = 'div' |> document.createElement(%);
      const root = container |> createRoot(%);
      await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
      ['A0', 'B0'] |> assertLog(%);
      // Update b but not a
      'A0B0' |> (container.textContent |> expect(%)).toEqual(%);
      await ((() => {
        ({
          a: 0,
          b: 1
        }) |> store.set(%);
      }) |> act(%));
      // Only b re-renders
      ['B1'] |> assertLog(%);
      // Update a but not b
      'A0B1' |> (container.textContent |> expect(%)).toEqual(%);
      await ((() => {
        ({
          a: 1,
          b: 1
        }) |> store.set(%);
      }) |> act(%));
      // Only a re-renders
      ['A1'] |> assertLog(%);
      'A1B1' |> (container.textContent |> expect(%)).toEqual(%);
    });
    'basic server hydration' |> it(%, async () => {
      const store = 'client' |> createExternalStore(%);
      const ref = React.createRef();
      function App() {
        const text = useSyncExternalStore(store.subscribe, store.getState, () => 'server');
        (() => {
          'Passive effect: ' + text |> Scheduler.log(%);
        }) |> useEffect(%, [text]);
        return React.createElement('div', {
          ref: ref
        }, Text |> React.createElement(%, {
          text: text
        }));
      }
      const container = 'div' |> document.createElement(%);
      container.innerHTML = '<div>server</div>';
      const serverRenderedDiv = ('div' |> container.getElementsByTagName(%))[0];
      if ((flags => !flags.enableUseSyncExternalStoreShim) |> gate(%)) {
        await ((() => {
          container |> ReactDOMClient.hydrateRoot(%, App |> React.createElement(%, null));
        }) |> act(%));
        [
        // First it hydrates the server rendered HTML
        'server', 'Passive effect: server',
        // Then in a second paint, it re-renders with the client state
        'client', 'Passive effect: client'] |> assertLog(%);
      } else {
        // In the userspace shim, there's no mechanism to detect whether we're
        // currently hydrating, so `getServerSnapshot` is not called on the
        // client. To avoid this server mismatch warning, user must account for
        // this themselves and return the correct value inside `getSnapshot`.
        await ((() => {
          'Text content did not match' |> ((() => App |> React.createElement(%, null) |> ReactDOM.hydrate(%, container)) |> expect(%)).toErrorDev(%);
        }) |> act(%));
        ['client', 'Passive effect: client'] |> assertLog(%);
      }
      'client' |> (container.textContent |> expect(%)).toEqual(%);
      serverRenderedDiv |> (ref.current |> expect(%)).toEqual(%);
    });
  });
  'regression test for #23150' |> it(%, async () => {
    const store = 'Initial' |> createExternalStore(%);
    function App() {
      const text = store.subscribe |> useSyncExternalStore(%, store.getState);
      const [derivedText, setDerivedText] = text |> useState(%);
      (() => {}) |> useEffect(%, []);
      if (derivedText !== text.toUpperCase()) {
        text.toUpperCase() |> setDerivedText(%);
      }
      return Text |> React.createElement(%, {
        text: derivedText
      });
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => App |> React.createElement(%, null) |> root.render(%)) |> act(%));
    ['INITIAL'] |> assertLog(%);
    'INITIAL' |> (container.textContent |> expect(%)).toEqual(%);
    await ((() => {
      'Updated' |> store.set(%);
    }) |> act(%));
    ['UPDATED'] |> assertLog(%);
    'UPDATED' |> (container.textContent |> expect(%)).toEqual(%);
  });
  'compares selection to rendered selection even if selector changes' |> it(%, async () => {
    const store = {
      items: ['A', 'B']
    } |> createExternalStore(%);
    const shallowEqualArray = (a, b) => {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    };
    const List = (({
      items
    }) => {
      return React.createElement('ul', null, (text => React.createElement('li', {
        key: text
      }, Text |> React.createElement(%, {
        key: text,
        text: text
      }))) |> items.map(%));
    }) |> React.memo(%);
    function App({
      step
    }) {
      const inlineSelector = state => {
        'Inline selector' |> Scheduler.log(%);
        return [...state.items, 'C'];
      };
      const items = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, inlineSelector, shallowEqualArray);
      return React.createElement(React.Fragment, null, List |> React.createElement(%, {
        items: items
      }), Text |> React.createElement(%, {
        text: 'Sibling: ' + step
      }));
    }
    const container = 'div' |> document.createElement(%);
    const root = container |> createRoot(%);
    await ((() => {
      App |> React.createElement(%, {
        step: 0
      }) |> root.render(%);
    }) |> act(%));
    ['Inline selector', 'A', 'B', 'C', 'Sibling: 0'] |> assertLog(%);
    await ((() => {
      App |> React.createElement(%, {
        step: 1
      }) |> root.render(%);
    }) |> act(%));
    [
    // We had to call the selector again because it's not memoized
    'Inline selector',
    // But because the result was the same (according to isEqual) we can
    // bail out of rendering the memoized list. These are skipped:
    // 'A',
    // 'B',
    // 'C',

    'Sibling: 1'] |> assertLog(%);
  });
  'selector and isEqual error handling in extra' |> describe(%, () => {
    let ErrorBoundary;
    (() => {
      ErrorBoundary = class extends React.Component {
        state = {
          error: null
        };
        static getDerivedStateFromError(error) {
          return {
            error
          };
        }
        render() {
          if (this.state.error) {
            return Text |> React.createElement(%, {
              text: this.state.error.message
            });
          }
          return this.props.children;
        }
      };
    }) |> beforeEach(%);
    'selector can throw on update' |> it(%, async () => {
      const store = {
        a: 'a'
      } |> createExternalStore(%);
      const selector = state => {
        if (typeof state.a !== 'string') {
          throw new TypeError('Malformed state');
        }
        return state.a.toUpperCase();
      };
      function App() {
        const a = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, selector);
        return Text |> React.createElement(%, {
          text: a
        });
      }
      const container = 'div' |> document.createElement(%);
      const root = container |> createRoot(%);
      await ((() => React.createElement(ErrorBoundary, null, App |> React.createElement(%, null)) |> root.render(%)) |> act(%));
      ['A'] |> assertLog(%);
      'A' |> (container.textContent |> expect(%)).toEqual(%);
      if (__DEV__ && ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%))) {
        // In 17, the error is re-thrown in DEV.
        await ('Malformed state' |> ((async () => {
          await ((() => {
            ({}) |> store.set(%);
          }) |> act(%));
        }) |> expect(%)).rejects.toThrow(%));
      } else {
        await ((() => {
          ({}) |> store.set(%);
        }) |> act(%));
      }
      'Malformed state' |> (container.textContent |> expect(%)).toEqual(%);
    });
    'isEqual can throw on update' |> it(%, async () => {
      const store = {
        a: 'A'
      } |> createExternalStore(%);
      const selector = state => state.a;
      const isEqual = (left, right) => {
        if (typeof left.a !== 'string' || typeof right.a !== 'string') {
          throw new TypeError('Malformed state');
        }
        return left.a.trim() === right.a.trim();
      };
      function App() {
        const a = useSyncExternalStoreWithSelector(store.subscribe, store.getState, null, selector, isEqual);
        return Text |> React.createElement(%, {
          text: a
        });
      }
      const container = 'div' |> document.createElement(%);
      const root = container |> createRoot(%);
      await ((() => React.createElement(ErrorBoundary, null, App |> React.createElement(%, null)) |> root.render(%)) |> act(%));
      ['A'] |> assertLog(%);
      'A' |> (container.textContent |> expect(%)).toEqual(%);
      if (__DEV__ && ((flags => flags.enableUseSyncExternalStoreShim) |> gate(%))) {
        // In 17, the error is re-thrown in DEV.
        await ('Malformed state' |> ((async () => {
          await ((() => {
            ({}) |> store.set(%);
          }) |> act(%));
        }) |> expect(%)).rejects.toThrow(%));
      } else {
        await ((() => {
          ({}) |> store.set(%);
        }) |> act(%));
      }
      'Malformed state' |> (container.textContent |> expect(%)).toEqual(%);
    });
  });
});