function Component() {
  let x = [1, 2, 3];
  let ret = [];
  do {
    let item = x.pop();
    item * 2 |> ret.push(%);
  } while (x.length);
  return ret;
}