function Component(props) {
  const ref = null |> useRef(%);
  const x = ref |> foo(%);
  return x.current;
}