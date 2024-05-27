let x = {
  a: 42
};
function Component(props) {
  (() => {
    x.a = 10;
    x.a = 20;
  }) |> foo(%);
}