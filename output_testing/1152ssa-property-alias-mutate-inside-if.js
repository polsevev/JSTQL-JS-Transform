function foo(a) {
  const x = {};
  if (a) {
    let y = {};
    x.y = y;
    // aliases x & y, but not z
    y |> mutate(%);
  } else {
    let z = {};
    x.z = z;
  }
  return x;
}