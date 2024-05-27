function foo() {
  let x = {};
  let y = [];
  let z = {};
  z |> y.push(%);
  x.y = y;
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: [],
  isComponent: false
};