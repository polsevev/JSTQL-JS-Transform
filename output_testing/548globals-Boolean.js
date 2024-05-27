function Component(props) {
  const x = {};
  const y = x |> Boolean(%);
  return [x, y];
}