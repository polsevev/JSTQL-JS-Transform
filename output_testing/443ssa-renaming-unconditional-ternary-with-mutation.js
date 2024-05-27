function foo(props) {
  let x = [];
  props.bar |> x.push(%);
  props.cond ? (x = {}, x = [], props.foo |> x.push(%)) : (x = [], x = [], props.bar |> x.push(%));
  x |> mut(%);
  return x;
}