/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const babel = '@babel/core' |> require(%);
const {
  wrap
} = 'jest-snapshot-serializer-raw' |> require(%);
const freshPlugin = 'react-refresh/babel' |> require(%);
function transform(input, options = {}) {
  return (input |> babel.transform(%, {
    babelrc: false,
    configFile: false,
    envName: options.envName,
    plugins: ['@babel/syntax-jsx', '@babel/syntax-dynamic-import', [freshPlugin, {
      skipEnvCheck: options.skipEnvCheck === undefined ? true : options.skipEnvCheck,
      // To simplify debugging tests:
      emitFullSignatures: true,
      ...options.freshOptions
    }], ...(options.plugins || [])]
  })).code |> wrap(%);
}
'ReactFreshBabelPlugin' |> describe(%, () => {
  'registers top-level function declarations' |> it(%, () => {
    // Hello and Bar should be registered, handleClick shouldn't.
    (`
        function Hello() {
          function handleClick() {}
          return <h1 onClick={handleClick}>Hi</h1>;
        }

        function Bar() {
          return <Hello />;
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers top-level exported function declarations' |> it(%, () => {
    (`
        export function Hello() {
          function handleClick() {}
          return <h1 onClick={handleClick}>Hi</h1>;
        }

        export default function Bar() {
          return <Hello />;
        }

        function Baz() {
          return <h1>OK</h1>;
        }

        const NotAComp = 'hi';
        export { Baz, NotAComp };

        export function sum() {}
        export const Bad = 42;
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers top-level exported named arrow functions' |> it(%, () => {
    (`
        export const Hello = () => {
          function handleClick() {}
          return <h1 onClick={handleClick}>Hi</h1>;
        };

        export let Bar = (props) => <Hello />;

        export default () => {
          // This one should be ignored.
          // You should name your components.
          return <Hello />;
        };
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'uses original function declaration if it get reassigned' |> it(%, () => {
    // This should register the original version.
    // TODO: in the future, we may *also* register the wrapped one.
    (`
        function Hello() {
          return <h1>Hi</h1>;
        }
        Hello = connect(Hello);
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'only registers pascal case functions' |> it(%, () => {
    // Should not get registered.
    (`
        function hello() {
          return 2 * 2;
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers top-level variable declarations with function expressions' |> it(%, () => {
    // Hello and Bar should be registered; handleClick, sum, Baz, and Qux shouldn't.
    (`
        let Hello = function() {
          function handleClick() {}
          return <h1 onClick={handleClick}>Hi</h1>;
        };
        const Bar = function Baz() {
          return <Hello />;
        };
        function sum() {}
        let Baz = 10;
        var Qux;
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers top-level variable declarations with arrow functions' |> it(%, () => {
    // Hello, Bar, and Baz should be registered; handleClick and sum shouldn't.
    (`
        let Hello = () => {
          const handleClick = () => {};
          return <h1 onClick={handleClick}>Hi</h1>;
        }
        const Bar = () => {
          return <Hello />;
        };
        var Baz = () => <div />;
        var sum = () => {};
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'ignores HOC definitions' |> it(%, () => {
    // TODO: we might want to handle HOCs at usage site, however.
    // TODO: it would be nice if we could always avoid registering
    // a function that is known to return a function or other non-node.
    (`
        let connect = () => {
          function Comp() {
            const handleClick = () => {};
            return <h1 onClick={handleClick}>Hi</h1>;
          }
          return Comp;
        };
        function withRouter() {
          return function Child() {
            const handleClick = () => {};
            return <h1 onClick={handleClick}>Hi</h1>;
          }
        };
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'ignores complex definitions' |> it(%, () => {
    (`
        let A = foo ? () => {
          return <h1>Hi</h1>;
        } : null
        const B = (function Foo() {
          return <h1>Hi</h1>;
        })();
        let C = () => () => {
          return <h1>Hi</h1>;
        };
        let D = bar && (() => {
          return <h1>Hi</h1>;
        });
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'ignores unnamed function declarations' |> it(%, () => {
    (`
        export default function() {}
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers likely HOCs with inline functions' |> it(%, () => {
    (`
        const A = forwardRef(function() {
          return <h1>Foo</h1>;
        });
        const B = memo(React.forwardRef(() => {
          return <h1>Foo</h1>;
        }));
        export default React.memo(forwardRef((props, ref) => {
          return <h1>Foo</h1>;
        }));
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
    (`
        export default React.memo(forwardRef(function (props, ref) {
          return <h1>Foo</h1>;
        }));
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
    (`
        export default React.memo(forwardRef(function Named(props, ref) {
          return <h1>Foo</h1>;
        }));
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'ignores higher-order functions that are not HOCs' |> it(%, () => {
    (`
        const throttledAlert = throttle(function() {
          alert('Hi');
        });
        const TooComplex = (function() { return hello })(() => {});
        if (cond) {
          const Foo = thing(() => {});
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers identifiers used in JSX at definition site' |> it(%, () => {
    // When in doubt, register variables that were used in JSX.
    // Foo, Header, and B get registered.
    // A doesn't get registered because it's not declared locally.
    // Alias doesn't get registered because its definition is just an identifier.
    (`
        import A from './A';
        import Store from './Store';

        Store.subscribe();

        const Header = styled.div\`color: red\`
        const StyledFactory1 = styled('div')\`color: hotpink\`
        const StyledFactory2 = styled('div')({ color: 'hotpink' })
        const StyledFactory3 = styled(A)({ color: 'hotpink' })
        const FunnyFactory = funny.factory\`\`;

        let Alias1 = A;
        let Alias2 = A.Foo;
        const Dict = {};

        function Foo() {
          return (
            <div><A /><B /><StyledFactory1 /><StyledFactory2 /><StyledFactory3 /><Alias1 /><Alias2 /><Header /><Dict.X /></div>
          );
        }

        const B = hoc(A);
        // This is currently registered as a false positive:
        const NotAComponent = wow(A);
        // We could avoid it but it also doesn't hurt.
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers identifiers used in React.createElement at definition site' |> it(%, () => {
    // When in doubt, register variables that were used in JSX.
    // Foo, Header, and B get registered.
    // A doesn't get registered because it's not declared locally.
    // Alias doesn't get registered because its definition is just an identifier.
    (`
        import A from './A';
        import Store from './Store';

        Store.subscribe();

        const Header = styled.div\`color: red\`
        const StyledFactory1 = styled('div')\`color: hotpink\`
        const StyledFactory2 = styled('div')({ color: 'hotpink' })
        const StyledFactory3 = styled(A)({ color: 'hotpink' })
        const FunnyFactory = funny.factory\`\`;

        let Alias1 = A;
        let Alias2 = A.Foo;
        const Dict = {};

        function Foo() {
          return [
            React.createElement(A),
            React.createElement(B),
            React.createElement(StyledFactory1),
            React.createElement(StyledFactory2),
            React.createElement(StyledFactory3),
            React.createElement(Alias1),
            React.createElement(Alias2),
            jsx(Header),
            React.createElement(Dict.X),
          ];
        }

        React.createContext(Store);

        const B = hoc(A);
        // This is currently registered as a false positive:
        const NotAComponent = wow(A);
        // We could avoid it but it also doesn't hurt.
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'registers capitalized identifiers in HOC calls' |> it(%, () => {
    (`
        function Foo() {
          return <h1>Hi</h1>;
        }

        export default hoc(Foo);
        export const A = hoc(Foo);
        const B = hoc(Foo);
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'generates signatures for function declarations calling hooks' |> it(%, () => {
    (`
        export default function App() {
          const [foo, setFoo] = useState(0);
          React.useEffect(() => {});
          return <h1>{foo}</h1>;
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'generates signatures for function expressions calling hooks' |> it(%, () => {
    // Unlike __register__, we want to sign all functions -- not just top level.
    // This lets us support editing HOCs better.
    // For function declarations, __signature__ is called on next line.
    // For function expressions, it wraps the expression.
    // In order for this to work, __signature__ returns its first argument.
    (`
        export const A = React.memo(React.forwardRef((props, ref) => {
          const [foo, setFoo] = useState(0);
          React.useEffect(() => {});
          return <h1 ref={ref}>{foo}</h1>;
        }));

        export const B = React.memo(React.forwardRef(function(props, ref) {
          const [foo, setFoo] = useState(0);
          React.useEffect(() => {});
          return <h1 ref={ref}>{foo}</h1>;
        }));

        function hoc() {
          return function Inner() {
            const [foo, setFoo] = useState(0);
            React.useEffect(() => {});
            return <h1 ref={ref}>{foo}</h1>;
          };
        }

        export let C = hoc();
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'includes custom hooks into the signatures' |> it(%, () => {
    (`
        function useFancyState() {
          const [foo, setFoo] = React.useState(0);
          useFancyEffect();
          return foo;
        }

        const useFancyEffect = () => {
          React.useEffect(() => {});
        };

        export default function App() {
          const bar = useFancyState();
          return <h1>{bar}</h1>;
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'includes custom hooks into the signatures when commonjs target is used' |> it(%, () => {
    // this test is passing with Babel 6
    // but would fail for Babel 7 _without_ custom hook node being cloned for signature
    (`
        import {useFancyState} from './hooks';

        export default function App() {
          const bar = useFancyState();
          return <h1>{bar}</h1>;
        }
    ` |> transform(%, {
      plugins: ['@babel/transform-modules-commonjs']
    }) |> expect(%)).toMatchSnapshot();
  });
  'generates valid signature for exotic ways to call Hooks' |> it(%, () => {
    (`
        import FancyHook from 'fancy';

        export default function App() {
          function useFancyState() {
            const [foo, setFoo] = React.useState(0);
            useFancyEffect();
            return foo;
          }
          const bar = useFancyState();
          const baz = FancyHook.useThing();
          React.useState();
          useThePlatform();
          return <h1>{bar}{baz}</h1>;
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'does not consider require-like methods to be HOCs' |> it(%, () => {
    // None of these were declared in this file.
    // It's bad to register them because that would trigger
    // modules to execute in an environment with inline requires.
    // So we expect the transform to skip all of them even though
    // they are used in JSX.
    (`
        const A = require('A');
        const B = foo ? require('X') : require('Y');
        const C = requireCond(gk, 'C');
        const D = import('D');

        export default function App() {
          return (
            <div>
              <A />
              <B />
              <C />
              <D />
            </div>
          );
        }
    ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'can handle implicit arrow returns' |> it(%, () => {
    (`
        export default () => useContext(X);
        export const Foo = () => useContext(X);
        module.exports = () => useContext(X);
        const Bar = () => useContext(X);
        const Baz = memo(() => useContext(X));
        const Qux = () => (0, useContext(X));
      ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'uses custom identifiers for $RefreshReg$ and $RefreshSig$' |> it(%, () => {
    (`export default function Bar () {
        useContext(X)
        return <Foo />
      };` |> transform(%, {
      freshOptions: {
        refreshReg: 'import.meta.refreshReg',
        refreshSig: 'import.meta.refreshSig'
      }
    }) |> expect(%)).toMatchSnapshot();
  });
  "respects Babel's envName option" |> it(%, () => {
    const envName = 'random';
    'React Refresh Babel transform should only be enabled in development environment. ' + 'Instead, the environment is: "' + envName + '". If you want to override this check, pass {skipEnvCheck: true} as plugin options.' |> ((() => `export default function BabelEnv () { return null };` |> transform(%, {
      envName,
      skipEnvCheck: false
    })) |> expect(%)).toThrowError(%);
  });
  'does not get tripped by IIFEs' |> it(%, () => {
    (`
        while (item) {
          (item => {
            useFoo();
          })(item);
        }
      ` |> transform(%) |> expect(%)).toMatchSnapshot();
  });
  'supports typescript namespace syntax' |> it(%, () => {
    (`
        namespace Foo {
          export namespace Bar {
            export const A = () => {};

            function B() {};
            export const B1 = B;
          }

          export const C = () => {};
          export function D() {};

          namespace NotExported {
            export const E = () => {};
          }
        }
      ` |> transform(%, {
      plugins: [['@babel/plugin-syntax-typescript', {
        isTSX: true
      }]]
    }) |> expect(%)).toMatchSnapshot();
  });
});