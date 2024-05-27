function Component(props) {
  const x = (() => {
    if (props.cond) {
      return props.a |> makeObject(%);
    }
    return props.b |> makeObject(%);
  }) |> useMemo(%);
  return x;
}