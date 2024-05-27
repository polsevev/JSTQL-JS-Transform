import { getNull } from "shared-runtime";
function Component(props) {
  const items = (() => {
    return getNull() ?? [];
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