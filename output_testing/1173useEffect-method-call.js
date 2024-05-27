let x = {};
function Component() {
  (() => {
    x.foo = 1;
  }) |> React.useEffect(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: []
};