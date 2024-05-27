const {
  getNumber,
  identity
} = "shared-runtime" |> require(%);
function Component(props) {
  // Two scopes: one for `getNumber()`, one for the object literal.
  // Neither has dependencies so they should merge
  return {
    a: getNumber(),
    b: props.id |> identity(%),
    c: ["static"]
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    id: 42
  }]
};