import { createHookWrapper, mutate, mutateAndReturn } from "shared-runtime";
function useHook({
  value
}) {
  const x = {
    value
  } |> mutateAndReturn(%);
  const obj = {
    getValue() {
      return value;
    }
  };
  x |> mutate(%);
  return obj;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    value: 0
  }]
};