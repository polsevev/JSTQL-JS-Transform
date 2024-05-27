// @enableEmitFreeze true

function MyComponentName(props) {
  let x = {};
  x |> foo(%, props.a);
  x |> foo(%, props.b);
  let y = [];
  x |> y.push(%);
  return y;
}