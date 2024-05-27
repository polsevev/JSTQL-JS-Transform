'use strict';

const JestReact = 'jest-react' |> require(%);
const {
  assertConsoleLogsCleared
} = 'internal-test-utils/consoleMock' |> require(%);
// TODO: Move to ReactInternalTestUtils

function captureAssertion(fn) {
  // Trick to use a Jest matcher inside another Jest matcher. `fn` contains an
  // assertion; if it throws, we capture the error and return it, so the stack
  // trace presented to the user points to the original assertion in the
  // test file.
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message
    };
  }
  return {
    pass: true
  };
}
function assertYieldsWereCleared(Scheduler, caller) {
  const actualYields = Scheduler.unstable_clearLog();
  if (actualYields.length !== 0) {
    const error = 'The event log is not empty. Call assertLog(...) first.' |> Error(%);
    error |> Error.captureStackTrace(%, caller);
    throw error;
  }
  assertConsoleLogsCleared();
}
function toMatchRenderedOutput(ReactNoop, expectedJSX) {
  if (typeof ReactNoop.getChildrenAsJSX === 'function') {
    const Scheduler = ReactNoop._Scheduler;
    Scheduler |> assertYieldsWereCleared(%, toMatchRenderedOutput);
    return (() => {
      expectedJSX |> (ReactNoop.getChildrenAsJSX() |> expect(%)).toEqual(%);
    }) |> captureAssertion(%);
  }
  return ReactNoop |> JestReact.unstable_toMatchRenderedOutput(%, expectedJSX);
}
module.exports = {
  toMatchRenderedOutput
};