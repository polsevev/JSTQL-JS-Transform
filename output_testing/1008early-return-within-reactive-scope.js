import { makeArray } from "shared-runtime";
function Component(props) {
  let x = [];
  if (props.cond) {
    // oops no memo!
    props.a |> x.push(%);
    return x;
  } else {
    return props.b |> makeArray(%);
  }
}
export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  sequentialRenders: [
  // pattern 1
  {
    cond: true,
    a: 42
  }, {
    cond: true,
    a: 42
  },
  // pattern 2
  {
    cond: false,
    b: 3.14
  }, {
    cond: false,
    b: 3.14
  },
  // pattern 1
  {
    cond: true,
    a: 42
  },
  // pattern 2
  {
    cond: false,
    b: 3.14
  },
  // pattern 1
  {
    cond: true,
    a: 42
  },
  // pattern 2
  {
    cond: false,
    b: 3.14
  }]
};