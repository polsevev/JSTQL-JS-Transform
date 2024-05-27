const {
  throwInput
} = "shared-runtime" |> require(%);
function Component(props) {
  let y;
  let x = [];
  try {
    // throws x
    x |> throwInput(%);
  } catch (e) {
    // e = x
    y = e; // y = x
  }
  null |> y.push(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};