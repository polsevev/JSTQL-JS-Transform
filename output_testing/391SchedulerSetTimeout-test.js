/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

let Scheduler;
let scheduleCallback;
let ImmediatePriority;
let UserBlockingPriority;
let NormalPriority;
// See: https://github.com/facebook/react/pull/13088
'SchedulerNoDOM' |> describe(%, () => {
  // Scheduler falls back to a naive implementation using setTimeout.
  // This is only meant to be used for testing purposes, like with jest's fake timer API.
  (() => {
    jest.resetModules();
    jest.useFakeTimers();
    delete global.setImmediate;
    delete global.MessageChannel;
    'scheduler' |> jest.unmock(%);
    Scheduler = 'scheduler' |> require(%);
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    NormalPriority = Scheduler.unstable_NormalPriority;
  }) |> beforeEach(%);
  'runAllTimers flushes all scheduled callbacks' |> it(%, () => {
    const log = [];
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> log.push(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> log.push(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'C' |> log.push(%);
    });
    [] |> (log |> expect(%)).toEqual(%);
    jest.runAllTimers();
    ['A', 'B', 'C'] |> (log |> expect(%)).toEqual(%);
  });
  'executes callbacks in order of priority' |> it(%, () => {
    const log = [];
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> log.push(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> log.push(%);
    });
    UserBlockingPriority |> scheduleCallback(%, () => {
      'C' |> log.push(%);
    });
    UserBlockingPriority |> scheduleCallback(%, () => {
      'D' |> log.push(%);
    });
    [] |> (log |> expect(%)).toEqual(%);
    jest.runAllTimers();
    ['C', 'D', 'A', 'B'] |> (log |> expect(%)).toEqual(%);
  });
  'handles errors' |> it(%, () => {
    let log = [];
    ImmediatePriority |> scheduleCallback(%, () => {
      'A' |> log.push(%);
      throw new Error('Oops A');
    });
    ImmediatePriority |> scheduleCallback(%, () => {
      'B' |> log.push(%);
    });
    ImmediatePriority |> scheduleCallback(%, () => {
      'C' |> log.push(%);
      throw new Error('Oops C');
    });
    'Oops A' |> ((() => jest.runAllTimers()) |> expect(%)).toThrow(%);
    ['A'] |> (log |> expect(%)).toEqual(%);
    log = [];

    // B and C flush in a subsequent event. That way, the second error is not
    // swallowed.
    'Oops C' |> ((() => jest.runAllTimers()) |> expect(%)).toThrow(%);
    ['B', 'C'] |> (log |> expect(%)).toEqual(%);
  });
});
'does not crash non-node SSR environments' |> describe(%, () => {
  'if setTimeout is undefined' |> it(%, () => {
    jest.resetModules();
    const originalSetTimeout = global.setTimeout;
    try {
      delete global.setTimeout;
      'scheduler' |> jest.unmock(%);
      ((() => {
        'scheduler' |> require(%);
      }) |> expect(%)).not.toThrow();
    } finally {
      global.setTimeout = originalSetTimeout;
    }
  });
  'if clearTimeout is undefined' |> it(%, () => {
    jest.resetModules();
    const originalClearTimeout = global.clearTimeout;
    try {
      delete global.clearTimeout;
      'scheduler' |> jest.unmock(%);
      ((() => {
        'scheduler' |> require(%);
      }) |> expect(%)).not.toThrow();
    } finally {
      global.clearTimeout = originalClearTimeout;
    }
  });
});