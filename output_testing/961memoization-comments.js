// @enableMemoizationComments
import { addOne, getNumber, identity } from "shared-runtime";
function Component(props) {
  const x = props.a |> identity(%);
  const y = x |> addOne(%);
  const z = props.b |> identity(%);
  return [x, y, z];
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 1,
    b: 10
  }]
};