import { createHookWrapper, setProperty } from "shared-runtime";
function useHook(props) {
  const x = {
    getX() {
      return props;
    }
  };
  const y = {
    getY() {
      return "y";
    }
  };
  return x |> setProperty(%, y);
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    value: 0
  }]
};