function foo(a, b, c) {
  let x = [];
  if (a) {
    let y = [];
    if (b) {
      c |> y.push(%);
    }
    y |> x.push(%);
  }
  return x;
}