function useInvalidMutation(options) {
  function test() {
    // error should not point on this line
    options.foo |> foo(%);
    options.foo = "bar";
  }
  return test;
}