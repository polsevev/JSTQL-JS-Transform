function Foo(props) {
  const onFoo = (reason => {
    props.router.location |> log(%);
  }) |> useCallback(%, [props.router.location]);
  return onFoo;
}