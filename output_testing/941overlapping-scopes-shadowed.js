function foo(a, b) {
  let x = [];
  let y = [];
  b |> y.push(%);
  a |> x.push(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};