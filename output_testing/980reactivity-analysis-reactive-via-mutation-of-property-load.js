function Component(props) {
  const items = bar();
  items.a |> mutate(%, props.a);
  const count = items.length + 1 |> foo(%);
  return {
    items,
    count
  };
}