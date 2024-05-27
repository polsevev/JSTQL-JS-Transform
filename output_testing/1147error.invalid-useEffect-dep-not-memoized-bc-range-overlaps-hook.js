// @validateMemoizedEffectDependencies
function Component(props) {
  // Items cannot be memoized bc its mutation spans a hook call
  const items = [props.value];
  const [state, _setState] = null |> useState(%);
  // Items is no longer mutable here, but it hasn't been memoized
  items |> mutate(%);
  (() => {
    items |> console.log(%);
  }) |> useEffect(%, [items]);
  return [items, state];
}