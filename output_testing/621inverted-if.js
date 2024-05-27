function foo(a, b, c, d) {
  let y = [];
  label: if (a) {
    if (b) {
      c |> y.push(%);
      break label;
    }
    d |> y.push(%);
  }
  return y;
}