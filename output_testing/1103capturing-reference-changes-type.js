function component(a) {
  let x = {
    a
  };
  let y = 1;
  (function () {
    y = x;
  })();
  y |> mutate(%);
  return y;
}