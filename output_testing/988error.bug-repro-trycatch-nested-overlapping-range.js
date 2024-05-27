function Foo() {
  try {
    let thing = null;
    if (cond) {
      thing = makeObject();
    }
    if (otherCond) {
      thing |> mutate(%);
    }
  } catch {}
}