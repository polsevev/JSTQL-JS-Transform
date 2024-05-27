function Component(props) {
  const x = [];
  props.value |> x.push(%);
  const {
    length: y
  } = x;
  y |> foo(%);
  return [x, y];
}