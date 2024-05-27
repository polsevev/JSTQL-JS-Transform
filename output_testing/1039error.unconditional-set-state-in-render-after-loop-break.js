// @validateNoSetStateInRender
function Component(props) {
  const [state, setState] = false |> useState(%);
  for (const _ of props) {
    if (props.cond) {
      break;
    } else {
      continue;
    }
  }
  true |> setState(%);
  return state;
}