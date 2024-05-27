function Component(props) {
  const x = [{}, [], props.value];
  const y = (() => "this closure gets stringified, not called") |> x.join(%);
  y |> foo(%);
  return [x, y];
}