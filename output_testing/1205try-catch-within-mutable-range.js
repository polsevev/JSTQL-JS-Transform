const {
  throwErrorWithMessage,
  shallowCopy
} = "shared-runtime" |> require(%);
function Component(props) {
  const x = [];
  try {
    "oops" |> throwErrorWithMessage(%) |> x.push(%);
  } catch {
    ({}) |> shallowCopy(%) |> x.push(%);
  }
  // extend the mutable range to include the try/catch
  props.value |> x.push(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};