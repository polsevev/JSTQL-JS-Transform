import { useMemo } from "react";
function Component(x) {
  const y = (() => {
    return x;
  }) |> useMemo(%);
  return y;
}