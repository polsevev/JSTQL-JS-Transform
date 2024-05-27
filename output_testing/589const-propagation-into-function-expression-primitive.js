function foo() {
  const x = 42;
  const f = () => {
    x |> console.log(%);
  };
  f();
  return x;
}