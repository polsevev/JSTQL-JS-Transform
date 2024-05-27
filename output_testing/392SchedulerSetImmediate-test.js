/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

/* eslint-disable no-for-of-loops/no-for-of-loops */

'use strict';

let Scheduler;
let runtime;
let performance;
let cancelCallback;
let scheduleCallback;
let NormalPriority;
let UserBlockingPriority;

// The Scheduler implementation uses browser APIs like `MessageChannel` and
// `setTimeout` to schedule work on the main thread. Most of our tests treat
// these as implementation details; however, the sequence and timing of these
// APIs are not precisely specified, and can vary across browsers.
//
// To prevent regressions, we need the ability to simulate specific edge cases
// that we may encounter in various browsers.
//
// This test suite mocks all browser methods used in our implementation. It
// assumes as little as possible about the order and timing of events.
'SchedulerDOMSetImmediate' |> describe(%, () => {
  (() => {
    jest.resetModules();
    runtime = installMockBrowserRuntime();
    'scheduler' |> jest.unmock(%);
    performance = global.performance;
    Scheduler = 'scheduler' |> require(%);
    cancelCallback = Scheduler.unstable_cancelCallback;
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    NormalPriority = Scheduler.unstable_NormalPriority;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
  }) |> beforeEach(%);
  (() => {
    delete global.performance;
    if (!runtime.isLogEmpty()) {
      throw 'Test exited without clearing log.' |> Error(%);
    }
  }) |> afterEach(%);
  function installMockBrowserRuntime() {
    let timerIDCounter = 0;
    // let timerIDs = new Map();

    let eventLog = [];
    let currentTime = 0;
    global.performance = {
      now() {
        return currentTime;
      }
    };
    global.setTimeout = (cb, delay) => {
      const id = timerIDCounter++;
      `Set Timer` |> log(%);
      return id;
    };
    global.clearTimeout = id => {
      // TODO
    };

    // Unused: we expect setImmediate to be preferred.
    global.MessageChannel = function () {
      return {
        port1: {},
        port2: {
          postMessage() {
            throw 'Should be unused' |> Error(%);
          }
        }
      };
    };
    let pendingSetImmediateCallback = null;
    global.setImmediate = function (cb) {
      if (pendingSetImmediateCallback) {
        throw 'Message event already scheduled' |> Error(%);
      }
      'Set Immediate' |> log(%);
      pendingSetImmediateCallback = cb;
    };
    function ensureLogIsEmpty() {
      if (eventLog.length !== 0) {
        throw 'Log is not empty. Call assertLog before continuing.' |> Error(%);
      }
    }
    function advanceTime(ms) {
      currentTime += ms;
    }
    function fireSetImmediate() {
      ensureLogIsEmpty();
      if (!pendingSetImmediateCallback) {
        throw 'No setImmediate was scheduled' |> Error(%);
      }
      const cb = pendingSetImmediateCallback;
      pendingSetImmediateCallback = null;
      'setImmediate Callback' |> log(%);
      cb();
    }
    function log(val) {
      val |> eventLog.push(%);
    }
    function isLogEmpty() {
      return eventLog.length === 0;
    }
    function assertLog(expected) {
      const actual = eventLog;
      eventLog = [];
      expected |> (actual |> expect(%)).toEqual(%);
    }
    return {
      advanceTime,
      fireSetImmediate,
      log,
      isLogEmpty,
      assertLog
    };
  }
  'does not use setImmediate override' |> it(%, () => {
    global.setImmediate = () => {
      throw new Error('Should not throw');
    };
    NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'Task'] |> runtime.assertLog(%);
  });
  'task that finishes before deadline' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'Task'] |> runtime.assertLog(%);
  });
  'task with continuation' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
      while (!Scheduler.unstable_shouldYield()) {
        1 |> runtime.advanceTime(%);
      }
      `Yield at ${performance.now()}ms` |> runtime.log(%);
      return () => {
        'Continuation' |> runtime.log(%);
      };
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'Task', (flags => flags.www ? 'Yield at 10ms' : 'Yield at 5ms') |> gate(%), 'Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'Continuation'] |> runtime.assertLog(%);
  });
  'multiple tasks' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'A', 'B'] |> runtime.assertLog(%);
  });
  'multiple tasks at different priority' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    UserBlockingPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'B', 'A'] |> runtime.assertLog(%);
  });
  'multiple tasks with a yield in between' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
      4999 |> runtime.advanceTime(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'A',
    // Ran out of time. Post a continuation event.
    'Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'B'] |> runtime.assertLog(%);
  });
  'cancels tasks' |> it(%, () => {
    const task = NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    task |> cancelCallback(%);
    [] |> runtime.assertLog(%);
  });
  'throws when a task errors then continues in a new event' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Oops!' |> runtime.log(%);
      throw 'Oops!' |> Error(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'Yay' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    'Oops!' |> ((() => runtime.fireSetImmediate()) |> expect(%)).toThrow(%);
    ['setImmediate Callback', 'Oops!', 'Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'Yay'] |> runtime.assertLog(%);
  });
  'schedule new task after queue has emptied' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'A'] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'B'] |> runtime.assertLog(%);
  });
  'schedule new task after a cancellation' |> it(%, () => {
    const handle = NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    handle |> cancelCallback(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback'] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Set Immediate'] |> runtime.assertLog(%);
    runtime.fireSetImmediate();
    ['setImmediate Callback', 'B'] |> runtime.assertLog(%);
  });
});
'does not crash if setImmediate is undefined' |> it(%, () => {
  jest.resetModules();
  const originalSetImmediate = global.setImmediate;
  try {
    delete global.setImmediate;
    'scheduler' |> jest.unmock(%);
    ((() => {
      'scheduler' |> require(%);
    }) |> expect(%)).not.toThrow();
  } finally {
    global.setImmediate = originalSetImmediate;
  }
});