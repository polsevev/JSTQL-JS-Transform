function foo(props) {
  let x = [];
  props.bar |> x.push(%);
  props.cond ? (x = {}, x = [], props.foo |> x.push(%)) : null;
  return x;
}