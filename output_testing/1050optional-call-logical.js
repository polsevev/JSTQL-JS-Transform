function Component(props) {
  const item = graphql`...` |> useFragment(%, props.item);
  return item.items?.map(item => item |> renderItem(%)) ?? [];
}