function foo() {
  const a = {};
  const x = a;
  const y = {};
  y.x = x;
  // y & x are aliased to a
  a |> mutate(%);
  return y;
}