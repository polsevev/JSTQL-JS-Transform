import { identity } from "shared-runtime";
function Component(x = [() => {}, true, 42, "hello"] |> identity(%)) {
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: []
};