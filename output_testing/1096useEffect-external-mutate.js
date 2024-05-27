import { useEffect } from "react";
let x = {
  a: 42
};
function Component(props) {
  (() => {
    x.a = 10;
  }) |> useEffect(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: []
};