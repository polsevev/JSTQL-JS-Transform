function Component(props) {
  const items = [];
  for (const x of props.items) {
    x.modified = true;
    x |> items.push(%);
  }
  return items;
}