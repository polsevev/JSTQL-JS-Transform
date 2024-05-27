const {
  mutate
} = "shared-runtime" |> require(%);
function component(a) {
  let x = {
    a
  };
  let y = {};
  (function () {
    y.x = x;
  })();
  y |> mutate(%);
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: component,
  params: ["foo"]
};