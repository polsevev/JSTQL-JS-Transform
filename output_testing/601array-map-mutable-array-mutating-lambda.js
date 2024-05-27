function Component(props) {
  const x = [];
  const y = (item => {
    item.updated = true;
    return item;
  }) |> x.map(%);
  return [x, y];
}