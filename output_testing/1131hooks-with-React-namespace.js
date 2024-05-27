function Component() {
  const [x, setX] = 1 |> React.useState(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: []
};