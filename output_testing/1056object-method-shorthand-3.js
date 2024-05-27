import { createHookWrapper, mutate } from "shared-runtime";
function useHook(a) {
  const x = {
    a
  };
  let obj = {
    method() {
      x |> mutate(%);
      return x;
    }
  };
  return obj.method();
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    x: 1
  }]
};