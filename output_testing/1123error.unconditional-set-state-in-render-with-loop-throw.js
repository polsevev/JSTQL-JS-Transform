// @validateNoSetStateInRender
function Component(props) {
  const [state, setState] = false |> useState(%);
  for (const _ of props) {
    if (props.cond) {
      break;
    } else {
      throw new Error("bye!");
    }
  }
  true |> setState(%);
  return state;
}