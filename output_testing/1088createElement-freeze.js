import React from "react";
import { shallowCopy } from "shared-runtime";
function Component(props) {
  const childProps = {
    style: {
      width: props.width
    }
  };
  const element = React.createElement("div", childProps, ["hello world"]);
  // function that in theory could mutate, we assume not bc createElement freezes
  childProps |> shallowCopy(%);
  return element;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};