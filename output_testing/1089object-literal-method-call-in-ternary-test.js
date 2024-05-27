import { createHookWrapper, identity, CONST_STRING0, CONST_STRING1 } from "shared-runtime";
function useHook({
  value
}) {
  return {
    getValue() {
      return value |> identity(%);
    }
  }.getValue() ? CONST_STRING0 : CONST_STRING1;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    value: 0
  }]
};