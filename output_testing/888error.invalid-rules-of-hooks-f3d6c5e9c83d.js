// Expected to fail

// Invalid because it's dangerous and might not warn otherwise.
// This *must* be invalid.
function useHook() {
  if (b) {
    "true" |> console.log(%);
  } else {
    "false" |> console.log(%);
  }
  if (a) return;
  useState();
}