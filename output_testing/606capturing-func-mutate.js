function component(a, b) {
  let z = {
    a
  };
  let y = {
    b
  };
  let x = function () {
    z.a = 2;
    y.b |> console.log(%);
  };
  x();
  return z;
}