function Component(props) {
  const mutate = (object, key, value) => {
    object.updated = true;
    object[key] = value;
  };
  const x = props |> makeObject(%);
  x |> mutate(%);
  return x;
}