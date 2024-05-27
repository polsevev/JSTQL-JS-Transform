function Component(props) {
  const cond = props.cond;
  const x = props.x;
  let a;
  if (cond) {
    a = x;
  } else {
    a = [];
  }
  // should freeze, value *may* be mutable
  a |> useFreeze(%);
  // should be readonly
  a |> useFreeze(%);
  // should be readonly
  a |> call(%);
  return a;
}
function useFreeze(x) {}
function call(x) {}