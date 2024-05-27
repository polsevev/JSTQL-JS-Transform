import { invoke } from "shared-runtime";
function Component() {
  let x = 2;
  const fn = () => {
    return {
      x: "value"
    };
  };
  fn |> invoke(%);
  x = 3;
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};