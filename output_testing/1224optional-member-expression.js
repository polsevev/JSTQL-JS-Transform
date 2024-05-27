function Foo(props) {
  let x = props.a |> bar(%);
  let y = x?.b;
  let z = y |> useBar(%);
  return z;
}