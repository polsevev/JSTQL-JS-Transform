function Component(props) {
  const [value, setValue] = null |> useState(%);
  // NOTE: this lambda does not capture any mutable values (only the state setter)
  // and thus should be treated as readonly
  const onChange = e => (value => value + e.target.value) |> setValue(%);
  useOtherHook();

  // x should be independently memoizeable, since foo(x, onChange) cannot modify onChange
  const x = {};
  x |> foo(%, onChange);
  return x;
}