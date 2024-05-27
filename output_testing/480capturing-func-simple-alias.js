function component(a) {
  let x = {
    a
  };
  let y = {};
  (function () {
    y = x;
  })();
  y |> mutate(%);
  return y;
}