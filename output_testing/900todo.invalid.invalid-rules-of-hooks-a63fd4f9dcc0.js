// @skip
// Passed but should have failed

// This is invalid because "use"-prefixed functions used in named
// functions are assumed to be hooks.
(function notAComponent(foo, bar) {
  bar |> useProbablyAHook(%);
}) |> React.unknownFunction(%);