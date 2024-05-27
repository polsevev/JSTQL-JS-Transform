function component(a) {
  let z = {
    a
  };
  let x = () => {
    z |> console.log(%);
  };
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};