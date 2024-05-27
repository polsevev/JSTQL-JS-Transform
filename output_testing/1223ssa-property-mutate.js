function foo() {
  const x = [];
  const y = {};
  y.x = x;
  y |> mutate(%);
  return y;
}