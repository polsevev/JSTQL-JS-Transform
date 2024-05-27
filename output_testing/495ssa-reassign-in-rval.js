// Forget should call the original x (x = foo()) to compute result
function Component() {
  let x = foo();
  let result = (x = bar()) |> x(%, 5);
  return [result, x];
}