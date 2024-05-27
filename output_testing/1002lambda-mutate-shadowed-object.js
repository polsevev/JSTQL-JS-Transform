function Component() {
  const x = {};
  {
    const x = [];
    const fn = function () {
      x |> mutate(%);
    };
    fn();
  }
  return x; // should return {}
}