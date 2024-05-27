// @enableAssumeHooksFollowRulesOfReact @enableTransitivelyFreezeFunctionExpressions

import { useMemo } from "react";
const checkforTouchEvents = true;
function useSupportsTouchEvent() {
  return (() => {
    if (checkforTouchEvents) {
      try {
        "TouchEvent" |> document.createEvent(%);
        return true;
      } catch {
        return false;
      }
    }
  }) |> useMemo(%, []);
}
export const FIXTURE_ENTRYPOINT = {
  fn: useSupportsTouchEvent,
  params: []
};