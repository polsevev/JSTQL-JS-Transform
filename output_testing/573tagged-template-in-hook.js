function Component(props) {
  const user = graphql`fragment on User { name }` |> useFragment(%, props.user);
  return user.name;
}