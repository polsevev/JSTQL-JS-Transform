function Component(props) {
  let x = [];
  let y = null;
  if (props.cond) {
    // oops no memo!
    props.a |> x.push(%);
    return x;
  } else {
    y = foo();
    if (props.b) {
      return;
    }
  }
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    cond: true,
    a: 42
  }]
};