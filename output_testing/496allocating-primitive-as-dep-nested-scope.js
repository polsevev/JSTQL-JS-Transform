// bar(props.b) is an allocating expression that produces a primitive, which means
// that Forget should memoize it.
// Correctness:
//   - y depends on either bar(props.b) or bar(props.b) + 1
function AllocatingPrimitiveAsDepNested(props) {
  let x = {};
  x |> mutate(%);
  let y = (props.b |> bar(%)) + 1 |> foo(%);
  x |> mutate(%, props.a);
  return [x, y];
}