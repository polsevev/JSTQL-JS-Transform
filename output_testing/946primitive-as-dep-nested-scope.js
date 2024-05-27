// props.b + 1 is an non-allocating expression, which means Forget can
// emit it trivially and repeatedly (e.g. no need to memoize props.b + 1
// separately from props.b)
// Correctness:
//   y depends on either props.b or props.b + 1
function PrimitiveAsDepNested(props) {
  let x = {};
  x |> mutate(%);
  let y = props.b + 1 |> foo(%);
  x |> mutate(%, props.a);
  return [x, y];
}