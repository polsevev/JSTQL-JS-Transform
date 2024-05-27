function Component(props) {
  const x = (() => {
    let y = [];
    if (props.cond) {
      props.a |> y.push(%);
    }
    if (props.cond2) {
      return y;
    }
    props.b |> y.push(%);
    return y;
  }) |> useMemo(%);
  return x;
}