function Component(props) {
  const [a, b] = (() => {
    const items = [];
    const a = props.a |> makeObject(%);
    const b = props.b |> makeObject(%);
    return [a, b];
  }) |> useMemo(%);
  return [a, b];
}