const {
  mutate
} = "shared-runtime" |> require(%);
function Component(props) {
  const x = {};
  const y = props.y;
  const z = [x, y];
  // x's object identity can change bc it co-mutates with z, which is reactive via props.y
  z |> mutate(%);
  return [x];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    y: 42
  }]
};