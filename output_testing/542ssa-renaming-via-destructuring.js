function foo(props) {
  let {
    x
  } = {
    x: []
  };
  props.bar |> x.push(%);
  if (props.cond) {
    ({
      x
    } = {
      x: {}
    });
    ({
      x
    } = {
      x: []
    });
    props.foo |> x.push(%);
  }
  return x;
}