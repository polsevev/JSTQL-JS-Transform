function Component(props) {
  const x = [];
  const y = (item => {
    item.updated = true;
    return item;
  }) |> x.map(%);
  return [x, y];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}],
  isComponent: false
};