function Component(props) {
  const x = (() => {
    label: {
      if (props.cond) {
        break label;
      }
      return props.a;
    }
    return props.b;
  }) |> useMemo(%);
  return x;
}