// @validateNoSetStateInRender
function Component(props) {
  const [x, setX] = 0 |> useState(%);
  const foo = () => {
    1 |> setX(%);
  };
  const bar = () => {
    foo();
  };
  const baz = () => {
    bar();
  };
  baz();
  return [x];
}