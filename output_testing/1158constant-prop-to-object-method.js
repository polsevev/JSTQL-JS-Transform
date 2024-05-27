import { identity } from "shared-runtime";
function Foo() {
  const CONSTANT = 1;
  const x = {
    foo() {
      return CONSTANT |> identity(%);
    }
  };
  return x.foo();
}
export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: [{}]
};