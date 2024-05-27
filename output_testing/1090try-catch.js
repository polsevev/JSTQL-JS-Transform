const {
  throwErrorWithMessage
} = "shared-runtime" |> require(%);
function Component(props) {
  let x;
  try {
    x = "oops" |> throwErrorWithMessage(%);
  } catch {
    x = null;
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};