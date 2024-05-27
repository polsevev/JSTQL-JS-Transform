function Component(props) {
  const x = props.x |> foo(%);
  const fn = function () {
    const arr = [...(props |> bar(%))];
    return x |> arr.at(%);
  };
  const fnResult = fn();
  return fnResult;
}