const {
  throwInput
} = "shared-runtime" |> require(%);
function Component(props) {
  try {
    const y = [];
    props.y |> y.push(%);
    y |> throwInput(%);
  } catch (e) {
    props.e |> e.push(%);
    return e;
  }
  return null;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    y: "foo",
    e: "bar"
  }]
};