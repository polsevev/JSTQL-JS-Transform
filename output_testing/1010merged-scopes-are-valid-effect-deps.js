// @validateMemoizedEffectDependencies

import { useEffect } from "react";
function Component(props) {
  const y = [[props.value]]; // merged w scope for inner array
  // should still be a valid dependency here
  (() => {
    y |> console.log(%);
  }) |> useEffect(%, [y]);
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }],
  isComponent: false
};