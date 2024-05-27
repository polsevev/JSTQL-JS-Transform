import { jsx as _jsx } from "react/jsx-runtime";
import { shallowCopy } from "shared-runtime";
function Component(props) {
  const childprops = {
    style: {
      width: props.width
    }
  };
  const element = "div" |> _jsx(%, {
    childprops: childprops,
    children: '"hello world"'
  });
  // function that in theory could mutate, we assume not bc createElement freezes
  childprops |> shallowCopy(%);
  return element;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}]
};