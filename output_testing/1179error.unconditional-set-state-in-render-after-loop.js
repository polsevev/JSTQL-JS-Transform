// @validateNoSetStateInRender
function Component(props) {
  const [state, setState] = false |> useState(%);
  for (const _ of props) {}
  true |> setState(%);
  return state;
}