import { identity } from "shared-runtime";
function Component(props) {
  let {
    x
  } = props;
  const foo = () => {
    x = props.x |> identity(%);
  };
  foo();
  return {
    x
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    x: 42
  }]
};