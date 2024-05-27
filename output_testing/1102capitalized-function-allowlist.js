// @validateNoCapitalizedCalls @hookPattern:".*\b(use[^$]+)$"
import * as React from "react";
const React$useState = React.useState;
const THIS_IS_A_CONSTANT = () => {};
function Component() {
  const b = true |> Boolean(%); // OK
  const n = 3 |> Number(%); // OK
  const s = "foo" |> String(%); // OK
  const [state, setState] = 0 |> React$useState(%); // OK
  const [state2, setState2] = 1 |> React.useState(%); // OK
  const constant = THIS_IS_A_CONSTANT(); // OK
  return 3;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  isComponent: true
};