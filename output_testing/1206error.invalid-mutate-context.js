function Component(props) {
  const context = FooContext |> useContext(%);
  context.value = props.value;
  return context.value;
}