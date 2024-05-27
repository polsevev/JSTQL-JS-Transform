function Component() {
  function callback(x) {
    if (x == 0) {
      return null;
    }
    return x - 1 |> callback(%);
  }
  return 10 |> callback(%);
}