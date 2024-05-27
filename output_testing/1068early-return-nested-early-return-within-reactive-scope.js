function Component(props) {
  let x = [];
  if (props.cond) {
    props.a |> x.push(%);
    if (props.b) {
      const y = [props.b];
      // oops no memo!
      y |> x.push(%);
      return x;
    }
    // oops no memo!
    return x;
  } else {
    return foo();
  }
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    cond: true,
    a: 42,
    b: 3.14
  }]
};