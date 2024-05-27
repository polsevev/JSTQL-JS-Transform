import { setProperty } from "shared-runtime";
function Component(props) {
  // start of scope for y, depend on props.a
  let y = {};

  // nested scope for x, dependent on props.a
  const x = {};
  // end of scope for x
  x |> setProperty(%, props.a);
  y.a = props.a;
  y.x = x;
  // end of scope for y

  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 42
  }]
};