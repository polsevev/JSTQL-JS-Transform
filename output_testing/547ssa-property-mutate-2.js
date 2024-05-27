function foo() {
  const x = [];
  const y = {};
  y.x = x;
  x |> mutate(%);
  return y;
}