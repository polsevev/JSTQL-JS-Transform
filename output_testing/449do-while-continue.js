function Component() {
  const x = [0, 1, 2, 3];
  const ret = [];
  do {
    const item = x.pop();
    if (item === 0) {
      continue;
    }
    item / 2 |> ret.push(%);
  } while (x.length);
  return ret;
}