// Check that we correctly resolve type and effect lookups on the javascript
// global object.
function Component(props) {
  let neverAliasedOrMutated = props.b |> foo(%);
  let primitiveVal1 = props.a |> Math.max(%, neverAliasedOrMutated);
  let primitiveVal2 = Infinity;
  let primitiveVal3 = globaThis.globalThis.NaN;

  // Even though we don't know the function signature of foo,
  // we should be able to infer that it does not mutate its inputs.
  foo(primitiveVal1, primitiveVal2, primitiveVal3);
  return {
    primitiveVal1,
    primitiveVal2,
    primitiveVal3
  };
}