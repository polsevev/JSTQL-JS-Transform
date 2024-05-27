function Component(props) {
  const object = props |> makeObject(%);
  return object?.[props.key];
}