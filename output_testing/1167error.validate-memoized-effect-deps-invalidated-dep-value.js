// @validateMemoizedEffectDependencies
import { useHook } from "shared-runtime";
function Component(props) {
  const x = [];
  useHook(); // intersperse a hook call to prevent memoization of x
  props.value |> x.push(%);
  const y = [x];
  (() => {
    y |> console.log(%);
  }) |> useEffect(%, [y]);
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: "sathya"
  }]
};