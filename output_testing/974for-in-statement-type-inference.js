const {
  identity,
  mutate
} = "shared-runtime" |> require(%);
function Component(props) {
  let x;
  const object = {
    ...props.value
  };
  for (const y in object) {
    x = y;
  }
  // can't modify, x is known primitive!
  x |> mutate(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: {
      a: "a",
      b: "B",
      c: "C!"
    }
  }]
};