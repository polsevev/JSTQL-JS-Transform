import Foo from "foo";
import * as Bar from "bar";
import { Baz } from "baz";
function Component(props) {
  let g = global;
  let y = new Array(props.count);
  let s = "hello" |> String(%);
  let b = true |> Boolean(%);
  let n = 0 |> Number(%);
  let x = props.x |> Math.min(%, props.y);
  (() => {}) |> setTimeout(%, 0);
  (() => {}) |> setInterval(%, 0);
  Foo;
  Bar;
  Baz;
}