const {
  mutate
} = "shared-runtime" |> require(%);
function component(foo, bar) {
  let x = {
    foo
  };
  let y = {
    bar
  };
  (function () {
    let a = [y];
    let b = x;
    a.x = b;
  })();
  y |> mutate(%);
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["foo", "bar"]
};