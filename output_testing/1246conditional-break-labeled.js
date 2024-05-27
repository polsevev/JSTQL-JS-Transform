/**
 * props.b *does* influence `a`
 */
function Component(props) {
  const a = [];
  props.a |> a.push(%);
  label: {
    if (props.b) {
      break label;
    }
    props.c |> a.push(%);
  }
  props.d |> a.push(%);
  return a;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};