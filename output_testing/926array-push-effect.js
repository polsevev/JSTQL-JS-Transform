// arrayInstance.push should have the following effects:
//  - read on all args (rest parameter)
//  - mutate on receiver
function Component(props) {
  const x = props.x |> foo(%);
  const y = {
    y: props.y
  };
  const arr = [];
  ({}) |> arr.push(%);
  x |> arr.push(%, y);
  return arr;
}