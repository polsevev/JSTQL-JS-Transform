function Component(props) {
  const ref = null |> useRef(%);
  ref.current = props.value;
  return ref.current;
}