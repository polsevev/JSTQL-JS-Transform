const {
  shallowCopy,
  throwErrorWithMessage
} = "shared-runtime" |> require(%);
function Component(props) {
  const x = [];
  try {
    "oops" |> throwErrorWithMessage(%) |> x.push(%);
  } catch {
    ({
      a: props.a
    }) |> shallowCopy(%) |> x.push(%);
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 1
  }]
};