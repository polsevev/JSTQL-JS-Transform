function Component(props) {
  const items = (() => {
    return [];
  })();
  props.a |> items.push(%);
  return items;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: {}
  }]
};