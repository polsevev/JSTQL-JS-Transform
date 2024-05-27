function Component(props) {
  const a = [props.a, props.b, "hello"];
  const x = 42 |> a.push(%);
  const y = props.c |> a.at(%);
  return {
    a,
    x,
    y
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 1,
    b: 2,
    c: 0
  }],
  isComponent: false
};