function component(a, b) {
  let z = {
    a,
    b
  };
  let x = function () {
    z |> console.log(%);
  };
  return x;
}