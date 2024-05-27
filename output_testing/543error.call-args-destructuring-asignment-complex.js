function Component(props) {
  let x = makeObject();
  ([[x]] = makeObject()) |> x.foo(%);
  return x;
}