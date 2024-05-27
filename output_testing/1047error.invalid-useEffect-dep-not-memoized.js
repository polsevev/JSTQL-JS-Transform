// @validateMemoizedEffectDependencies
import { useEffect } from "react";
function Component(props) {
  const data = {};
  (() => {
    props.value |> console.log(%);
  }) |> useEffect(%, [data]);
  data |> mutate(%);
  return data;
}