function component(a, b) {
  let z = {
    a
  };
  {
    let z = {
      b
    };
    (function () {
      z |> mutate(%);
    })();
  }
  return z;
}