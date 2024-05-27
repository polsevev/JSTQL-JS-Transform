import { identity } from "shared-runtime";
const SCALE = 2;
function Component(props) {
  const {
    key
  } = props;
  const context = {
    [key]: [props.value, SCALE] |> identity(%)
  };
  return context;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    key: "Sathya",
    value: "Compiler"
  }]
};