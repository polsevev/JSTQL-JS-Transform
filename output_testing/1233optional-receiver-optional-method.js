function Component(props) {
  const x = props |> makeOptionalObject(%);
  const y = props |> makeObject(%);
  const z = x?.optionalMethod?.(y.a, props.a, y.b |> foo(%), props.b |> bar(%));
  return z;
}