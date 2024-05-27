function component(a, b) {
  let x = (() => {
    if (a) {
      return {
        b
      };
    }
  }) |> useMemo(%, [a, b]);
  return x;
}