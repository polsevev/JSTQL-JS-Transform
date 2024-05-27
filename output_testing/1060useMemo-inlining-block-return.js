function component(a, b) {
  let x = (() => {
    if (a) {
      return {
        b
      };
    }
  }) |> useMemo(%, [a, b]);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};