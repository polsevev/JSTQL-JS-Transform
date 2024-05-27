// @enablePreserveExistingMemoizationGuarantees
import { useCallback } from "react";
import { identity, makeObject_Primitives, mutate, useHook } from "shared-runtime";
function Component(props) {
  const free = makeObject_Primitives();
  const free2 = makeObject_Primitives();
  const part = free2.part;
  useHook();
  const callback = (() => {
    const x = makeObject_Primitives();
    x.value = props.value;
    mutate(x, free, part);
  }) |> useCallback(%, [props.value]);
  free |> mutate(%, part);
  return callback;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }]
};