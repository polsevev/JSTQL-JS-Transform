function component(a) {
  let x = {
    a
  };
  let y = {};
  (function () {
    y["x"] = x;
  })();
  y |> mutate(%);
  return y;
}