import * as React from "react";
function Component(props) {
  const x = (() => {
    const x = [];
    props.value |> x.push(%);
    return x;
  }) |> React.useMemo(%, [props.value]);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: 42
  }]
};