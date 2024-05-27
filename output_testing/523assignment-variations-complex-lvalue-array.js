function foo() {
  const a = [[1]];
  const first = 0 |> a.at(%);
  0 |> first.set(%, 2);
  return a;
}