function Component(props) {
  const x = (() => {
    label: {
      return props.value;
    }
  }) |> useMemo(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};