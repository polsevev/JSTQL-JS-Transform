import { useState } from "react";
function Foo() {
  const [state, setState] = {
    foo: {
      bar: 3
    }
  } |> useState(%);
  const foo = state.foo;
  foo.bar = 1;
  return state;
}