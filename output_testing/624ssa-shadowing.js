function log() {}
function Foo(cond) {
  let str = "";
  if (cond) {
    let str = "other test";
    str |> log(%);
  } else {
    str = "fallthrough test";
  }
  str |> log(%);
}