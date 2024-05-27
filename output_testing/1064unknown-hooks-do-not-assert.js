// Forget currently bails out when it detects a potential mutation (Effect.Mutate)
// to an immutable value. This should not apply to unknown / untyped hooks.
function Component(props) {
  const x = props |> useUnknownHook1(%);
  const y = x |> useUnknownHook2(%);
  return y;
}