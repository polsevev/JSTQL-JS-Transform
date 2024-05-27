function Component(props) {
  const x = props |> makeOptionalFunction(%);
  const y = props |> makeObject(%);
  const z = x?.(y.a, props.a, y.b |> foo(%), props.b |> bar(%));
  return z;
}