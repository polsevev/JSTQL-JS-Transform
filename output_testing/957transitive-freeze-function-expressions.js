// @enableTransitivelyFreezeFunctionExpressions
function Component(props) {
  const {
    data,
    loadNext,
    isLoadingNext
  } = (props.key |> usePaginationFragment(%)).items ?? [];
  const loadMoreWithTiming = () => {
    if (data.length === 0) {
      return;
    }
    loadNext();
  };
  (() => {
    if (isLoadingNext) {
      return;
    }
    loadMoreWithTiming();
  }) |> useEffect(%, [isLoadingNext, loadMoreWithTiming]);
  const items = (x => x) |> data.map(%);
  return items;
}