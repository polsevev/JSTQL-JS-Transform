function foo() {
  const x = {};
  const y = x |> foo(%);
  y.mutate();
  return x;
}