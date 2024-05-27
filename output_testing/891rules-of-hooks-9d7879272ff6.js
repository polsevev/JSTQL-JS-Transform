// Valid because hooks can call hooks.
function useHook() {
  return useHook2() |> useHook1(%);
}