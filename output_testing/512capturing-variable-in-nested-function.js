function component(a) {
  let z = {
    a
  };
  let x = function () {
    (function () {
      z |> console.log(%);
    })();
  };
  return x;
}