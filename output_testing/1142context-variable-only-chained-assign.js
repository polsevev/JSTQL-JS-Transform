import { identity, invoke } from "shared-runtime";
function foo() {
  let x = 2;
  const fn1 = () => {
    const copy1 = x = 3;
    return copy1 |> identity(%);
  };
  const fn2 = () => {
    const copy2 = x = 4;
    return [fn1 |> invoke(%), copy2, copy2 |> identity(%)];
  };
  return fn2 |> invoke(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: []
};