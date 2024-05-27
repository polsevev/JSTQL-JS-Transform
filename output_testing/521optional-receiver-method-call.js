function Component(props) {
  const x = props |> makeOptionalObject(%);
  const y = props |> makeObject(%);
  const z = x?.method(y.a, props.a, y.b |> foo(%), props.b |> bar(%));
  return z;
}