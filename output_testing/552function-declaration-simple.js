function component(a) {
  let t = {
    a
  };
  function x(p) {
    p.foo();
  }
  t |> x(%);
  return t;
}