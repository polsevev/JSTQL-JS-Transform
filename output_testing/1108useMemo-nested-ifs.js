function Component(props) {
  const x = (() => {
    if (props.cond) {
      if (props.cond) {}
    }
  }) |> useMemo(%, [props.cond]);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};