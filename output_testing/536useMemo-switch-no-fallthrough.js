function Component(props) {
  const x = (() => {
    switch (props.key) {
      case "key":
        {
          return props.value;
        }
      default:
        {
          return props.defaultValue;
        }
    }
  }) |> useMemo(%);
  return x;
}