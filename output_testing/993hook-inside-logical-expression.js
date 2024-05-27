function Component(props) {
  const user = graphql`...` |> useFragment(%, props.user) ?? {};
  return user.name;
}