function Component(props) {
  const a = [props.a, props.b, "hello"];
  const x = 42 |> a.push(%);
  const y = props.c |> a.at(%);
  return {
    a,
    x,
    y
  };
}