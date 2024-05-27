function component(a) {
  let x = {
    a
  };
  let y = {};
  (function () {
    let a = y;
    a["x"] = x;
  })();
  y |> mutate(%);
  return y;
}