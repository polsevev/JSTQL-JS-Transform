function Component(props) {
  const items = bar();
  items[props.key] |> mutate(%, props.a);
  const count = items.length + 1 |> foo(%);
  return {
    items,
    count
  };
}