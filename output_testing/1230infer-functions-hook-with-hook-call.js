// @compilationMode(infer)
function useStateValue(props) {
  const [state, _] = null |> useState(%);
  return [state];
}