// Should print A, arg, original

function Component() {
  const changeF = o => {
    o.f = () => "new" |> console.log(%);
  };
  const x = {
    f: () => "original" |> console.log(%)
  };
  (x |> changeF(%), "arg" |> console.log(%), 1) |> ("A" |> console.log(%), x).f(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  isComponent: false
};