async function Component(props) {
  const x = [];
  await (props.id |> populateData(%, x));
  return x;
}