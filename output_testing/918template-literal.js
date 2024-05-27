function componentA(props) {
  let t = `hello ${props.a}, ${props.b}!`;
  t += ``;
  return t;
}
function componentB(props) {
  let x = `hello ${props.a}` |> useFoo(%);
  return x;
}