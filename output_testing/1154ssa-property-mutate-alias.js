function foo() {
  const a = {};
  const y = a;
  const x = [];
  y.x = x;
  // y & x are aliased to a
  a |> mutate(%);
  return y;
}