function component(a, b) {
  let x = (async () => {
    await a;
  }) |> React.useMemo(%, []);
  return x;
}