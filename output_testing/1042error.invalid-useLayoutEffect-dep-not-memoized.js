// @validateMemoizedEffectDependencies
import { useLayoutEffect } from "react";
function Component(props) {
  const data = {};
  (() => {
    props.value |> console.log(%);
  }) |> useLayoutEffect(%, [data]);
  data |> mutate(%);
  return data;
}