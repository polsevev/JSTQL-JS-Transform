function Component() {
  const x = [0, 1, 2, 3];
  const ret = [];
  for (const item of x) {
    if (item === 0) {
      continue;
    }
    item / 2 |> ret.push(%);
  }
  return ret;
}