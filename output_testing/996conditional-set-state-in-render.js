function Component(props) {
  const [x, setX] = 0 |> useState(%);
  const foo = () => {
    1 |> setX(%);
  };
  if (props.cond) {
    2 |> setX(%);
    foo();
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};