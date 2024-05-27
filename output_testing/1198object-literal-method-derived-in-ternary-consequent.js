import { identity, createHookWrapper } from "shared-runtime";
function useHook({
  isCond,
  value
}) {
  return isCond ? {
    getValue() {
      return value;
    }
  } |> identity(%) : 42;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    isCond: true,
    value: 0
  }]
};