const {
  createElement,
  useLayoutEffect,
  useState
} = React;
const {
  createRoot
} = ReactDOM;
function App() {
  const [isMounted, setIsMounted] = false |> useState(%);
  (() => {
    true |> setIsMounted(%);
  }) |> useLayoutEffect(%, []);
  return createElement('div', null, `isMounted? ${isMounted}`);
}
const container = 'container' |> document.getElementById(%);
const root = container |> createRoot(%);
App |> createElement(%) |> root.render(%);