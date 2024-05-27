function Component() {
  const a = [];
  const b = a;
  a |> useFreeze(%);
  // should be readonly, value is guaranteed frozen via alias
  b |> foo(%);
  return b;
}
function useFreeze() {}
function foo(x) {}