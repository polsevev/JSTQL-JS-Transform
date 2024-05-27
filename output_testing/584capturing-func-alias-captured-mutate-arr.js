function component(foo, bar) {
  let x = {
    foo
  };
  let y = {
    bar
  };
  (function () {
    let a = [y];
    let b = x;
    a.x = b;
  })();
  y |> mutate(%);
  return y;
}