import { useMemo } from "react";
function Component(props) {
  const outerHandlers = (() => {
    let handlers = {
      value: props.value
    };
    switch (props.test) {
      case true:
        {
          handlers.value |> console.log(%);
          break;
        }
      default:
        {}
    }
    return handlers;
  }) |> useMemo(%);
  return outerHandlers;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    test: true,
    value: "hello"
  }]
};