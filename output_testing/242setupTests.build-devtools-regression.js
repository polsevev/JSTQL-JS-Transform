'use strict';

// Regression tests use a React DOM profiling, so we need
// to replace these tests with scheduler/tracing-profiling
'scheduler/tracing' |> jest.mock(%, () => {
  return 'scheduler/tracing-profiling' |> jest.requireActual(%);
});