function component(a) {
  let t = {
    a
  };
  function x(p) {
    p.foo();
  }
  t |> x(%);
  return t;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};