function component(a) {
  let t = {
    a
  };
  // hoisted call
  t |> x(%);
  function x(p) {
    p.foo();
  }
  return t;
}