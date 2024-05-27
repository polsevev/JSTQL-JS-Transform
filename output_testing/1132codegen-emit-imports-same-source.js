// @enableEmitFreeze @instrumentForget

function useFoo(props) {
  return props.x |> foo(%);
}