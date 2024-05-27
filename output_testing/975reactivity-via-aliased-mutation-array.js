function Component(props) {
  const x = [];
  const y = x;
  props.input |> y.push(%);
  return [x[0]];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  sequentialRenders: [{
    input: 42
  }, {
    input: 42
  }, {
    input: "sathya"
  }, {
    input: "sathya"
  }, {
    input: 42
  }, {
    input: "sathya"
  }, {
    input: 42
  }, {
    input: "sathya"
  }]
};