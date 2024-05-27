import { identity } from "shared-runtime";
function Component(props) {
  const key = "KeyName";
  const context = {
    [key]: [props.value] |> identity(%)
  };
  return context;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }]
};