function component(a) {
  let t = {
    a
  };
  function x() {
    t.foo();
  }
  t |> x(%);
  return t;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};