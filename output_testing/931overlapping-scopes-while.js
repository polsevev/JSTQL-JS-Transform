function foo(a, b, c) {
  let x = [];
  let y = [];
  while (c) {
    b |> y.push(%);
    a |> x.push(%);
  }
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};