function Component(props) {
  let y = 0;
  const [x, setX] = 0 |> useState(%);
  const foo = () => {
    1 |> setX(%);
    y = 1; // TODO: force foo's mutable range to extend, but ideally we can just remove this line
  };
  foo();
  return [x, y];
}