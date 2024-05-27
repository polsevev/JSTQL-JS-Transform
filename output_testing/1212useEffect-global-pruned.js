import { useEffect } from "react";
function someGlobal() {}
function useFoo() {
  const fn = (() => function () {
    someGlobal();
  }) |> React.useMemo(%, []);
  (() => {
    fn();
  }) |> useEffect(%, [fn]);
  return null;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
  isComponent: false
};