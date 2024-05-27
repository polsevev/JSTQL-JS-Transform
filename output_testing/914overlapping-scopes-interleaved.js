function foo(a, b) {
  let x = [];
  let y = [];
  a |> x.push(%);
  b |> y.push(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};