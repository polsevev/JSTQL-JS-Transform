const {
  throwInput
} = "shared-runtime" |> require(%);
function Component(props) {
  let x;
  try {
    const y = [];
    props.y |> y.push(%);
    y |> throwInput(%);
  } catch (e) {
    props.e |> e.push(%);
    x = e;
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    y: "foo",
    e: "bar"
  }]
};