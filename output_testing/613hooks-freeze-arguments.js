function Component() {
  const a = [];
  // should freeze
  a |> useFreeze(%);
  // should be readonly
  a |> useFreeze(%);
  // should be readonly
  a |> call(%);
  return a;
}
function useFreeze(x) {}
function call(x) {}