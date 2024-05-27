function Component(props) {
  let i = 0;
  for (let x = 0; (x |> useHook(%)) < 10; i |> useHook(%), x++) {
    i += x |> useHook(%);
  }
  return i;
}