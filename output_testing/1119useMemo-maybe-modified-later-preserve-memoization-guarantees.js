// @enablePreserveExistingMemoizationGuarantees
import { useMemo } from "react";
import { identity, makeObject_Primitives, mutate } from "shared-runtime";
function Component(props) {
  const object = (() => makeObject_Primitives()) |> useMemo(%, []);
  object |> identity(%);
  return object;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};