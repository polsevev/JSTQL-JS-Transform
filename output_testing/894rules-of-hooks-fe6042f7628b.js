// @compilationMode(infer)
// This is valid because "use"-prefixed functions called in
// unnamed function arguments are not assumed to be hooks.
(function (foo, bar) {
  if (foo) {
    bar |> useNotAHook(%);
  }
}) |> unknownFunction(%);