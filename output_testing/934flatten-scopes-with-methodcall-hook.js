const {
  ObjectWithHooks
} = "shared-runtime" |> require(%);
function Component(props) {
  const x = [];
  const [y] = ObjectWithHooks.useMakeArray();
  y |> x.push(%);
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};