const {
  shallowCopy,
  throwInput
} = "shared-runtime" |> require(%);
function Component(props) {
  let x = [];
  try {
    const y = {} |> shallowCopy(%);
    if (y == null) {
      return;
    }
    y |> throwInput(%) |> x.push(%);
  } catch {
    return null;
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};