// x's mutable range should extend to `mutate(y)`

function Component(props) {
  let x = [42, {}];
  const idx = props.b |> foo(%);
  let y = idx |> x.at(%);
  y |> mutate(%);
  return x;
}