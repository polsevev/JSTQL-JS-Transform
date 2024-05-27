function Component(props) {
  const [x, setX] = 0 |> useState(%);
  const aliased = setX;
  1 |> setX(%);
  2 |> aliased(%);
  return x;
}