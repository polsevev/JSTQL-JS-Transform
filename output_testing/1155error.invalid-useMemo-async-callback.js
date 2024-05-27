function component(a, b) {
  let x = (async () => {
    await a;
  }) |> useMemo(%, []);
  return x;
}