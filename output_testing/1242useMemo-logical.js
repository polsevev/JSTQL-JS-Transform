function Component(props) {
  const x = (() => props.a && props.b) |> useMemo(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};