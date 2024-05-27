// We should codegen nested optional properties correctly
// (i.e. placing `?` in the correct PropertyLoad)
function Component(props) {
  let x = props.a?.b.c.d |> foo(%);
  return x;
}