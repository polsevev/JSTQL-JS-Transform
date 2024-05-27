function component() {
  let z = [];
  let y = {};
  y.z = z;
  let x = {};
  x.y = y;
  x.y.z |> mutate(%);
  return x;
}