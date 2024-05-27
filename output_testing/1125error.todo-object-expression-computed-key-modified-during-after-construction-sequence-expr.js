import { identity, mutate, mutateAndReturn } from "shared-runtime";
function Component(props) {
  const key = {};
  const context = {
    [(key |> mutate(%), key)]: [props.value] |> identity(%)
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