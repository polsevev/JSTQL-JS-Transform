import { useState } from "react";
import { createHookWrapper } from "shared-runtime";
function useHook({
  value
}) {
  const [state] = false |> useState(%);
  return {
    getX() {
      return {
        a: [],
        getY() {
          return value;
        },
        state
      };
    }
  };
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook |> createHookWrapper(%),
  params: [{
    value: 0
  }]
};