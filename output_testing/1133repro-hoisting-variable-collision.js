function Component(props) {
  const items = (x => x) |> props.items.map(%);
  const x = 42;
  return [x, items];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    items: [0, 42, null, undefined, {
      object: true
    }]
  }]
};