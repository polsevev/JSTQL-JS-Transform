function useHook(a, b) {
  switch (a) {
    case 1:
      if (b == null) {
        return;
      }
      b |> console.log(%);
      break;
    case 2:
      return;
    default:
      return;
  }
}
export const FIXTURE_ENTRYPOINT = {
  fn: useHook,
  params: [1, "foo"]
};