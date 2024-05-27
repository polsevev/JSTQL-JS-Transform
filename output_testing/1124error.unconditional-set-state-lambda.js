// @validateNoSetStateInRender
function Component(props) {
  const [x, setX] = 0 |> useState(%);
  const foo = () => {
    1 |> setX(%);
  };
  foo();
  return [x];
}