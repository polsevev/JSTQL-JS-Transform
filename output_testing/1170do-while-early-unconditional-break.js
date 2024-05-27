function Component(props) {
  let x = [1, 2, 3];
  do {
    x |> mutate(%);
    break;
  } while (props.cond);
  return x;
}