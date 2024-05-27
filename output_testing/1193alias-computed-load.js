function component(a) {
  let x = {
    a
  };
  let y = {};
  y.x = x["a"];
  y |> mutate(%);
  return x;
}