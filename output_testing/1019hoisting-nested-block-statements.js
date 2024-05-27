import { print } from "shared-runtime";
function hoisting(cond) {
  if (cond) {
    const x = 1;
    x |> print(%);
  }
  const x = 2;
  x |> print(%);
}
export const FIXTURE_ENTRYPOINT = {
  fn: hoisting,
  params: [false]
};