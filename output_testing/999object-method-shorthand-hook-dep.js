import { createHookWrapper } from "shared-runtime";
import { useState } from "react";
function useFoo() {
  const [state, _setState] = false |> useState(%);
  return {
    func() {
      return state;
    }
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: useFoo |> createHookWrapper(%),
  params: [{}]
};