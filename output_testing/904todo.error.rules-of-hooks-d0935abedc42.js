// @skip
// Unsupported input

// This is valid because "use"-prefixed functions called in
// unnamed function arguments are not assumed to be hooks.
((foo, bar) => {
  if (foo) {
    bar |> useNotAHook(%);
  }
}) |> React.unknownFunction(%);