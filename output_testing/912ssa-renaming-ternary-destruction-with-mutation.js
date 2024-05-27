function foo(props) {
  let x = [];
  props.bar |> x.push(%);
  props.cond ? (({
    x
  } = {
    x: {}
  }), [x] = [[]], props.foo |> x.push(%)) : null;
  x |> mut(%);
  return x;
}