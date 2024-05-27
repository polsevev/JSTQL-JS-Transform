function useFoo(props) {
  let x;
  [x] = props;
  const foo = () => {
    x = props |> getX(%);
  };
  foo();
  return {
    x
  };
}