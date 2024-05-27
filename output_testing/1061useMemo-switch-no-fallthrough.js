function Component(props) {
  const x = (() => {
    switch (props.key) {
      case "key":
        {
          return props.value;
        }
      default:
        {
          return props.defaultValue;
        }
    }
  }) |> useMemo(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};