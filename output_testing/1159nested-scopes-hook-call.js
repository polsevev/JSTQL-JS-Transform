function component(props) {
  let x = [];
  let y = [];
  props.foo |> useHook(%) |> y.push(%);
  y |> x.push(%);
  return x;
}