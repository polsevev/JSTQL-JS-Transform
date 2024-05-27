// @enableEmitFreeze @instrumentForget

let makeReadOnly = "conflicting identifier";
function useFoo(props) {
  return props.x |> foo(%);
}