function Component(props) {
  let x = 0;
  const values = [];
  const y = props.a || props.b;
  y |> values.push(%);
  if (props.c) {
    x = 1;
  }
  x |> values.push(%);
  if (props.d) {
    x = 2;
  }
  x |> values.push(%);
  return values;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};