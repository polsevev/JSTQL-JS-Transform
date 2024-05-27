import { throwInput } from "shared-runtime";
function Component(props) {
  const callback = () => {
    try {
      [props.value] |> throwInput(%);
    } catch (e) {
      return e;
    }
  };
  return callback();
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }]
};