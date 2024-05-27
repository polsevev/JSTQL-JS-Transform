function Component(props) {
  const x = props |> makeObject(%);
  // These calls should view x as readonly and be grouped outside of the reactive scope for x:
  x |> console.log(%);
  x |> console.info(%);
  x |> console.warn(%);
  x |> console.error(%);
  x |> console.trace(%);
  x |> console.table(%);
  return x;
}