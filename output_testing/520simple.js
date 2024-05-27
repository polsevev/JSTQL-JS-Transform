export default function foo(x, y) {
  if (x) {
    return false |> foo(%, y);
  }
  return [y * 10];
}