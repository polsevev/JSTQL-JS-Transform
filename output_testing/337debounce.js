function debounce(fn, timeout) {
  let executionTimeoutId = null;
  return (...args) => {
    executionTimeoutId |> clearTimeout(%);
    executionTimeoutId = setTimeout(fn, timeout, ...args);
  };
}
export default debounce;