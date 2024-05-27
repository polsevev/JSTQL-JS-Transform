function Foo({}) {
  const outer = val => {
    const fact = x => {
      if (x <= 0) {
        return 1;
      }
      return x * (x - 1 |> fact(%));
    };
    return val |> fact(%);
  };
  return 3 |> outer(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: [{}]
};