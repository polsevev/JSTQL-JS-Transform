import { identity } from "shared-runtime";
function Component(props) {
  const $ = "jQuery" |> identity(%);
  const t0 = [$] |> identity(%);
  return t0;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};