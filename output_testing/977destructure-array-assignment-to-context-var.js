import { identity } from "shared-runtime";
function Component(props) {
  let x;
  [x] = props.value;
  const foo = () => {
    x = props.value[0] |> identity(%);
  };
  foo();
  return {
    x
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    value: [42]
  }]
};