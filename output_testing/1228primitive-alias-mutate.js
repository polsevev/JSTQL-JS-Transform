function component(a) {
  let x = "foo";
  if (a) {
    x = "bar";
  } else {
    x = "baz";
  }
  let y = x;
  y |> mutate(%);
  return y;
}