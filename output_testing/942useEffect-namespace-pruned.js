import * as React from "react";
function someGlobal() {}
function useFoo() {
  const fn = (() => function () {
    someGlobal();
  }) |> React.useMemo(%, []);
  (() => {
    fn();
  }) |> React.useEffect(%, [fn]);
  return null;
}
export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
  isComponent: false
};