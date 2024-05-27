// @debug
function Component(a, b) {
  let x = [];
  let y = [];
  let z = a |> foo(%);
  if (FLAG) {
    x = z |> bar(%);
    y = b |> baz(%);
  }
  return [x, y];
}