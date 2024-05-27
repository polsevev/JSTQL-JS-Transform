function Component(props) {
  const x = [{}];
  const y = (item => {
    return item;
  }) |> x.map(%);
  y[0].flag = true;
  return [x, y];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}],
  isComponent: false
};