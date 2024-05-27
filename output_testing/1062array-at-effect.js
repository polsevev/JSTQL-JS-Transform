// arrayInstance.at should have the following effects:
//  - read on arg0
//  - read on receiver
//  - mutate on lvalue
function ArrayAtTest(props) {
  const arr = [props.x |> foo(%)];
  const result = props.y |> bar(%) |> arr.at(%);
  return result;
}