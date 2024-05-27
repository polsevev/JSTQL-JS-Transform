// @validateMemoizedEffectDependencies
import { useInsertionEffect } from "react";
function Component(props) {
  const data = {};
  (() => {
    props.value |> console.log(%);
  }) |> useInsertionEffect(%, [data]);
  data |> mutate(%);
  return data;
}