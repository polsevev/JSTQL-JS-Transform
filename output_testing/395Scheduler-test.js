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
let requestPaint;
let shouldYield;
let NormalPriority;

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
'SchedulerBrowser' |> describe(%, () => {
  (() => {
    jest.resetModules();
    runtime = installMockBrowserRuntime();
    'scheduler' |> jest.unmock(%);
    performance = global.performance;
    Scheduler = 'scheduler' |> require(%);
    cancelCallback = Scheduler.unstable_cancelCallback;
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    NormalPriority = Scheduler.unstable_NormalPriority;
    requestPaint = Scheduler.unstable_requestPaint;
    shouldYield = Scheduler.unstable_shouldYield;
  }) |> beforeEach(%);
  (() => {
    delete global.performance;
    if (!runtime.isLogEmpty()) {
      throw 'Test exited without clearing log.' |> Error(%);
    }
  }) |> afterEach(%);
  function installMockBrowserRuntime() {
    let hasPendingMessageEvent = false;
    let isFiringMessageEvent = false;
    let hasPendingDiscreteEvent = false;
    let hasPendingContinuousEvent = false;
    let timerIDCounter = 0;
    // let timerIDs = new Map();

    let eventLog = [];
    let currentTime = 0;
    global.performance = {
      now() {
        return currentTime;
      }
    };

    // Delete node provide setImmediate so we fall through to MessageChannel.
    delete global.setImmediate;
    global.setTimeout = (cb, delay) => {
      const id = timerIDCounter++;
      // TODO
      `Set Timer` |> log(%);
      return id;
    };
    global.clearTimeout = id => {
      // TODO
    };
    const port1 = {};
    const port2 = {
      postMessage() {
        if (hasPendingMessageEvent) {
          throw 'Message event already scheduled' |> Error(%);
        }
        'Post Message' |> log(%);
        hasPendingMessageEvent = true;
      }
    };
    global.MessageChannel = function MessageChannel() {
      this.port1 = port1;
      this.port2 = port2;
    };
    function ensureLogIsEmpty() {
      if (eventLog.length !== 0) {
        throw 'Log is not empty. Call assertLog before continuing.' |> Error(%);
      }
    }
    function advanceTime(ms) {
      currentTime += ms;
    }
    function resetTime() {
      currentTime = 0;
    }
    function fireMessageEvent() {
      ensureLogIsEmpty();
      if (!hasPendingMessageEvent) {
        throw 'No message event was scheduled' |> Error(%);
      }
      hasPendingMessageEvent = false;
      const onMessage = port1.onmessage;
      'Message Event' |> log(%);
      isFiringMessageEvent = true;
      try {
        onMessage();
      } finally {
        isFiringMessageEvent = false;
        if (hasPendingDiscreteEvent) {
          'Discrete Event' |> log(%);
          hasPendingDiscreteEvent = false;
        }
        if (hasPendingContinuousEvent) {
          'Continuous Event' |> log(%);
          hasPendingContinuousEvent = false;
        }
      }
    }
    function scheduleDiscreteEvent() {
      if (isFiringMessageEvent) {
        hasPendingDiscreteEvent = true;
      } else {
        'Discrete Event' |> log(%);
      }
    }
    function scheduleContinuousEvent() {
      if (isFiringMessageEvent) {
        hasPendingContinuousEvent = true;
      } else {
        'Continuous Event' |> log(%);
      }
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
      resetTime,
      fireMessageEvent,
      log,
      isLogEmpty,
      assertLog,
      scheduleDiscreteEvent,
      scheduleContinuousEvent
    };
  }
  'task that finishes before deadline' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'Task'] |> runtime.assertLog(%);
  });
  'task with continuation' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      // Request paint so that we yield at the end of the frame interval
      'Task' |> runtime.log(%);
      requestPaint();
      while (!Scheduler.unstable_shouldYield()) {
        1 |> runtime.advanceTime(%);
      }
      `Yield at ${performance.now()}ms` |> runtime.log(%);
      return () => {
        'Continuation' |> runtime.log(%);
      };
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'Task', (flags => flags.www ? 'Yield at 10ms' : 'Yield at 5ms') |> gate(%), 'Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'Continuation'] |> runtime.assertLog(%);
  });
  'multiple tasks' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'A', 'B'] |> runtime.assertLog(%);
  });
  'multiple tasks with a yield in between' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
      4999 |> runtime.advanceTime(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'A',
    // Ran out of time. Post a continuation event.
    'Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'B'] |> runtime.assertLog(%);
  });
  'cancels tasks' |> it(%, () => {
    const task = NormalPriority |> scheduleCallback(%, () => {
      'Task' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    task |> cancelCallback(%);
    runtime.fireMessageEvent();
    ['Message Event'] |> runtime.assertLog(%);
  });
  'throws when a task errors then continues in a new event' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Oops!' |> runtime.log(%);
      throw 'Oops!' |> Error(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'Yay' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    'Oops!' |> ((() => runtime.fireMessageEvent()) |> expect(%)).toThrow(%);
    ['Message Event', 'Oops!', 'Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'Yay'] |> runtime.assertLog(%);
  });
  'schedule new task after queue has emptied' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'A'] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'B'] |> runtime.assertLog(%);
  });
  'schedule new task after a cancellation' |> it(%, () => {
    const handle = NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    handle |> cancelCallback(%);
    runtime.fireMessageEvent();
    ['Message Event'] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    ['Message Event', 'B'] |> runtime.assertLog(%);
  });
  'yielding continues in a new task regardless of how much time is remaining' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'Original Task' |> runtime.log(%);
      'shouldYield: ' + shouldYield() |> runtime.log(%);
      'Return a continuation' |> runtime.log(%);
      return () => {
        'Continuation Task' |> runtime.log(%);
      };
    });
    ['Post Message'] |> runtime.assertLog(%);
    runtime.fireMessageEvent();
    // No time has elapsed
    ['Message Event', 'Original Task',
    // Immediately before returning a continuation, `shouldYield` returns
    // false, which means there must be time remaining in the frame.
    'shouldYield: false', 'Return a continuation',
    // The continuation should be scheduled in a separate macrotask even
    // though there's time remaining.
    'Post Message'] |> runtime.assertLog(%);
    0 |> (performance.now() |> expect(%)).toBe(%);
    runtime.fireMessageEvent();
    ['Message Event', 'Continuation Task'] |> runtime.assertLog(%);
  });
});