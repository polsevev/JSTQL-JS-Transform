function component(a) {
  let z = {
    a
  };
  let x = function () {
    let z;
    z |> mutate(%);
  };
  return x;
}