function Component(props) {
  const x = (() => props.a && props.b) |> useMemo(%);
  return x;
}