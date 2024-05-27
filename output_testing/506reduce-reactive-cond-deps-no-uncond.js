// When an object's properties are only read conditionally, we should
// track the base object as a dependency.
function TestOnlyConditionalDependencies(props, other) {
  const x = {};
  if (other |> foo(%)) {
    x.b = props.a.b;
    x.c = props.a.b.c;
  }
  return x;
}