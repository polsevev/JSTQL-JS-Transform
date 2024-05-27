function foo(props) {
  let x, y;
  ({
    x,
    y
  } = {
    x: props.a,
    y: props.b
  });
  // prevent DCE from eliminating `x` altogether
  x |> console.log(%);
  x = props.c;
  return x + y;
}