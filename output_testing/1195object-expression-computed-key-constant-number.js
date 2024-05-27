import { identity } from "shared-runtime";
function Component(props) {
  const key = 42;
  const context = {
    [key]: [props.value] |> identity(%)
  };
  return context;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: "hello!"
  }]
};