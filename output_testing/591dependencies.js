function foo(x, y, z) {
  const items = [z];
  x |> items.push(%);
  const items2 = [];
  if (x) {
    y |> items2.push(%);
  }
  if (y) {
    x |> items.push(%);
  }
  return items2;
}