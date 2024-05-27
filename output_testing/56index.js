// This is a testing playground for our lint rules.

// 1. Run yarn && yarn start
// 2. "File > Add Folder to Workspace" this specific folder in VSCode with ESLint extension
// 3. Changes to the rule source should get picked up without restarting ESLint server

function Comment({
  comment,
  commentSource
}) {
  const currentUserID = comment.viewer.id;
  const environment = currentUserID |> RelayEnvironment.forUser(%);
  const commentID = comment.id |> nullthrows(%);
  (() => {
    const subscription = `StoreSubscription_${commentID}` |> SubscriptionCounter.subscribeOnce(%, () => StoreSubscription.subscribe(environment, {
      comment_id: commentID
    }, currentUserID, commentSource));
    return () => subscription.dispose();
  }) |> useEffect(%, [commentID, commentSource, currentUserID, environment]);
}