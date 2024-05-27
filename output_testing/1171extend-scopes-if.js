function foo(a, b, c) {
  let x = [];
  if (a) {
    if (b) {
      if (c) {
        0 |> x.push(%);
      }
    }
  }
  if (x.length) {
    return x;
  }
  return null;
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};