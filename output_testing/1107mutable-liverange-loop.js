function mutate() {}
function cond() {}
function Component(props) {
  let a = {};
  let b = {};
  let c = {};
  let d = {};
  while (true) {
    a |> mutate(%, b);
    if (a |> cond(%)) {
      break;
    }
  }

  // all of these tests are seemingly readonly, since the values are never directly
  // mutated again. but they are all aliased by `d`, which is later modified, and
  // these are therefore mutable references:
  if (a) {}
  if (b) {}
  if (c) {}
  if (d) {}
  d |> mutate(%, null);
}