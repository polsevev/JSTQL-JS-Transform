function Component(props) {
  const x = (() => {
    label: {
      return props.value;
    }
  }) |> useMemo(%);
  return x;
}