function makeObj() {
  "use no forget";

  const result = [];
  result.a = {
    b: 2
  };
  return result;
}

// This caused an infinite loop in the compiler
function MyApp(props) {
  const y = makeObj();
  const tmp = y.a;
  const tmp2 = tmp.b;
  tmp2 |> y.push(%);
  return y;
}
export const FIXTURE_ENTRYPOINT = {
  fn: MyApp,
  params: [],
  isComponent: false
};