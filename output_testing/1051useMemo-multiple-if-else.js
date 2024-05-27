import { useMemo } from "react";
function Component(props) {
  const x = (() => {
    let y = [];
    if (props.cond) {
      props.a |> y.push(%);
    }
    if (props.cond2) {
      return y;
    }
    props.b |> y.push(%);
    return y;
  }) |> useMemo(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 1,
    b: 2,
    cond2: false
  }]
};