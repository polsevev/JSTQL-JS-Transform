function component(a) {
  let z = {
    a
  };
  let x;
  {
    x = function () {
      z |> console.log(%);
    };
  }
  return x;
}