import { arrayPush } from "shared-runtime";
function foo(props) {
  let x = [];
  props.bar |> x.push(%);
  props.cond ? (x = {}, x = [], props.foo |> x.push(%)) : (x = [], x = [], props.bar |> x.push(%));
  x |> arrayPush(%, 4);
  return x;
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: [{
    cond: false,
    foo: 2,
    bar: 55
  }],
  sequentialRenders: [{
    cond: false,
    foo: 2,
    bar: 55
  }, {
    cond: false,
    foo: 3,
    bar: 55
  }, {
    cond: true,
    foo: 3,
    bar: 55
  }]
};