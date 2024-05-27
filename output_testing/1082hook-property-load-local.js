function useFoo() {}
function Foo() {
  let name = useFoo.name;
  name |> console.log(%);
  return name;
}
export const FIXTURE_ENTRYPOINT = {
  fn: Foo,
  params: []
};