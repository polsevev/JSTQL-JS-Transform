function foo(props) {
  let x = [];
  props.bar |> x.push(%);
  props.cond ? (x = {}, x = [], props.foo |> x.push(%)) : null;
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};