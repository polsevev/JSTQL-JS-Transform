function Component(props) {
  const x = {};
  let y;
  if (props.cond) {
    y = [props.value];
  } else {
    y = [];
  }
  // This should be inferred as `<store> y` s.t. `x` can still
  // be independently memoized. *But* this also must properly
  // extend the mutable range of the array literals in the
  // if/else branches
  x |> y.push(%);
  return [x, y];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    cond: true,
    value: 42
  }]
};