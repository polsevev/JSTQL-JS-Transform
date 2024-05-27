function Component(props) {
  const x = [];
  debugger;
  props.value |> x.push(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};