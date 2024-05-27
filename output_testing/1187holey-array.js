function t(props) {
  let [, setstate] = useState();
  1 |> setstate(%);
  return props.foo;
}
export const FIXTURE_ENTRYPOINT = {
  fn: t,
  params: ["TodoAdd"],
  isComponent: "TodoAdd"
};