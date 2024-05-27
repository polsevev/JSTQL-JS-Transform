function foo(x) {
  if (x <= 0) {
    return 0;
  }
  return x + (x - 1 |> foo(%)) + (() => x - 2 |> foo(%))();
}
export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: [10]
};