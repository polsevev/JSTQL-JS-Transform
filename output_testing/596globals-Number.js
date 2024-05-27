function Component(props) {
  const x = {};
  const y = x |> Number(%);
  return [x, y];
}