// Let's not support identifiers defined after use for now.
function component(a) {
  let y = function () {
    x |> m(%);
  };
  let x = {
    a
  };
  x |> m(%);
  return y;
}