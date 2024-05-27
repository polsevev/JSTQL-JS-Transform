function component(a) {
  let t = {
    a
  };
  function x() {
    t.foo();
  }
  t |> x(%);
  return t;
}