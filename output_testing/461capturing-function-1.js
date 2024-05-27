function component(a) {
  let z = {
    a
  };
  let x = function () {
    z |> console.log(%);
  };
  return x;
}