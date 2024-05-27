import { identity, mutate, mutateAndReturn } from "shared-runtime";
function Component(props) {
  const key = {};
  const context = {
    [key |> mutateAndReturn(%)]: [props.value] |> identity(%)
  };
  key |> mutate(%);
  return context;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }]
};