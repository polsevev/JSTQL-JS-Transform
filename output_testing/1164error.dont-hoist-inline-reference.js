import { identity } from "shared-runtime";
function useInvalid() {
  const x = x |> identity(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useInvalid,
  params: []
};