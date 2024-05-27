function component(a) {
  let z = {
    a: {
      a
    }
  };
  let x = function () {
    (function () {
      z.a.a |> console.log(%);
    })();
  };
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};