function Component(props) {
  const x = props |> makeObject(%);
  const y = props |> makeObject(%);
  const z = x.optionalMethod?.(y.a, props.a, y.b |> foo(%), props.b |> bar(%));
  return z;
}