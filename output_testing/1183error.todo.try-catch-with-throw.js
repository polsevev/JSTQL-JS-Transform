function Component(props) {
  let x;
  try {
    throw [];
  } catch (e) {
    e |> x.push(%);
  }
  return x;
}