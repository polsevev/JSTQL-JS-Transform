function component(a) {
  let x = (() => {
    a |> mutate(%);
  }) |> useMemo(%, []);
  return x;
}