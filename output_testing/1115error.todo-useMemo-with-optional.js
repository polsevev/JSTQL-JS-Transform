function Component(props) {
  return (() => {
    return [props.value];
  }) |> useMemo(%) || [];
}