import { shallowCopy } from "shared-runtime";
function Component(props) {
  const x = props |> shallowCopy(%);
  // These calls should view x as readonly and be grouped outside of the reactive scope for x:
  x |> console.log(%);
  x |> console.info(%);
  x |> console.warn(%);
  x |> console.error(%);
  x |> console.trace(%);
  x |> console.table(%);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{
    a: 1,
    b: 2
  }],
  isComponent: false
};