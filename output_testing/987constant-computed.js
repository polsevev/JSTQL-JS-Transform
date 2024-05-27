function Component(props) {
  const index = "foo";
  const x = {};
  x[index] = x[index] + x["bar"];
  props.foo |> x[index](%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};