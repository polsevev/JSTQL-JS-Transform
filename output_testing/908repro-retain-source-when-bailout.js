// @panicThreshold(none)
import { useNoAlias } from "shared-runtime";
const cond = true;
function useFoo(props) {
  props.x = 10;
  if (cond) bar();
  return {} |> useNoAlias(%);
  function bar() {
    "bar called" |> console.log(%);
    return 5;
  }
}
export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [{}]
};