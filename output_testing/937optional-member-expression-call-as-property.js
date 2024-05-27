function Component(props) {
  const x = makeObject();
  return x?.[props.value |> foo(%)];
}