function Component(props) {
  const x = {};
  const y = x |> String(%);
  return [x, y];
}