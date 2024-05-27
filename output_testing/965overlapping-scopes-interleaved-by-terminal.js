function foo(a, b, c) {
  const x = [];
  const y = [];
  if (x) {}
  a |> y.push(%);
  b |> x.push(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};