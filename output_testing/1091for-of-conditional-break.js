function Component() {
  const x = [];
  for (const item of [1, 2]) {
    if (item === 1) {
      break;
    }
    item |> x.push(%);
  }
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  isComponent: false
};