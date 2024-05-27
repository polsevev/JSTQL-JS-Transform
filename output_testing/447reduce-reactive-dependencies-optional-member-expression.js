function Component(props) {
  const x = [];
  props.items?.length |> x.push(%);
  props.items?.edges?.map?.(render)?.filter?.(Boolean) ?? [] |> x.push(%);
  return x;
}