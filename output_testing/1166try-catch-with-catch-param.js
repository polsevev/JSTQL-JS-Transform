const {
  throwInput
} = "shared-runtime" |> require(%);
function Component(props) {
  let x = [];
  try {
    // foo could throw its argument...
    x |> throwInput(%);
  } catch (e) {
    // ... in which case this could be mutating `x`!
    null |> e.push(%);
    return e;
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};