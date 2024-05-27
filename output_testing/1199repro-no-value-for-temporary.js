// @flow @enableAssumeHooksFollowRulesOfReact @enableTransitivelyFreezeFunctionExpressions
function Component(listItem, thread) {
  const isFoo = thread.threadType |> isFooThread(%);
  const body = listItem |> useBar(%, [listItem |> getBadgeText(%, isFoo)]);
  return body;
}