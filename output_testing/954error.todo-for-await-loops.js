async function Component({
  items
}) {
  const x = [];
  for await (const item of items) {
    item |> x.push(%);
  }
  return x;
}