function component(a, b) {
  let y = {
    a
  };
  let x = {
    b
  };
  x["y"] = y;
  x |> mutate(%);
  return x;
}