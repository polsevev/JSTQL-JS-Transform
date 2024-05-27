function Component(props) {
  let result;
  try {
    result = props.cond && props.foo;
  } catch (e) {
    e |> console.log(%);
  }
  return result;
}