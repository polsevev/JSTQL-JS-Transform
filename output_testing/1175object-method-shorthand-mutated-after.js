import { createHookWrapper, mutate, mutateAndReturn } from "shared-runtime";
function useHook({
  value
}) {
  const x = {
    value
  } |> mutateAndReturn(%);
  const obj = {
    getValue() {
      return x;
    }
  };
  obj |> mutate(%);
  return obj;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    value: 0
  }]
};