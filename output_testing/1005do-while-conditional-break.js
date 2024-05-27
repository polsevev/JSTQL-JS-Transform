function Component(props) {
  let x = [0, 1, 2, 3];
  do {
    if (x === 0) {
      break;
    }
    x |> mutate(%);
  } while (props.cond);
  return x;
}