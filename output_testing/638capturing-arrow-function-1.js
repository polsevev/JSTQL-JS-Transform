function component(a) {
  let z = {
    a
  };
  let x = () => {
    z |> console.log(%);
  };
  return x;
}