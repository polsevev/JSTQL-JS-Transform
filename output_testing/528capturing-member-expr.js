function component(a) {
  let z = {
    a
  };
  let x = function () {
    z.a |> console.log(%);
  };
  return x;
}