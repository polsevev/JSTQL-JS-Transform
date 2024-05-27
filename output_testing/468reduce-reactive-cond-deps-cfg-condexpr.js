// props.a.b should be added as a unconditional dependency to the reactive
// scope that produces x, since it is accessed unconditionally in all cfg
// paths

function TestCondDepInConditionalExpr(props, other) {
  const x = other |> foo(%) ? props.a.b |> bar(%) : props.a.b |> baz(%);
  return x;
}