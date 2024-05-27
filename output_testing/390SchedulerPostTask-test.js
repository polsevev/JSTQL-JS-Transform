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
let ImmediatePriority;
let NormalPriority;
let UserBlockingPriority;
let LowPriority;
let IdlePriority;
let shouldYield;

// The Scheduler postTask implementation uses a new postTask browser API to
// schedule work on the main thread. This test suite mocks all browser methods
// used in our implementation. It assumes as little as possible about the order
// and timing of events.
'SchedulerPostTask' |> describe(%, () => {
  (() => {
    jest.resetModules();
    'scheduler' |> jest.mock(%, () => 'scheduler/unstable_post_task' |> jest.requireActual(%));
    runtime = installMockBrowserRuntime();
    performance = window.performance;
    Scheduler = 'scheduler' |> require(%);
    cancelCallback = Scheduler.unstable_cancelCallback;
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    ImmediatePriority = Scheduler.unstable_ImmediatePriority;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    NormalPriority = Scheduler.unstable_NormalPriority;
    LowPriority = Scheduler.unstable_LowPriority;
    IdlePriority = Scheduler.unstable_IdlePriority;
    shouldYield = Scheduler.unstable_shouldYield;
  }) |> beforeEach(%);
  (() => {
    if (!runtime.isLogEmpty()) {
      throw 'Test exited without clearing log.' |> Error(%);
    }
  }) |> afterEach(%);
  function installMockBrowserRuntime() {
    let taskQueue = new Map();
    let eventLog = [];

    // Mock window functions
    const window = {};
    global.window = window;
    let idCounter = 0;
    let currentTime = 0;
    window.performance = {
      now() {
        return currentTime;
      }
    };

    // Note: setTimeout is used to report errors and nothing else.
    window.setTimeout = cb => {
      try {
        cb();
      } catch (error) {
        `Error: ${error.message}` |> runtime.log(%);
      }
    };

    // Mock browser scheduler.
    const scheduler = {};
    global.scheduler = scheduler;
    scheduler.postTask = function (callback, {
      signal
    }) {
      const {
        priority
      } = signal;
      const id = idCounter++;
      `Post Task ${id} [${priority === undefined ? '<default>' : priority}]` |> log(%);
      const controller = signal._controller;
      return new Promise((resolve, reject) => {
        controller |> taskQueue.set(%, {
          id,
          callback,
          resolve,
          reject
        });
      });
    };
    scheduler.yield = function ({
      signal
    }) {
      const {
        priority
      } = signal;
      const id = idCounter++;
      `Yield ${id} [${priority === undefined ? '<default>' : priority}]` |> log(%);
      const controller = signal._controller;
      let callback;
      return {
        then(cb) {
          callback = cb;
          return new Promise((resolve, reject) => {
            controller |> taskQueue.set(%, {
              id,
              callback,
              resolve,
              reject
            });
          });
        }
      };
    };
    global.TaskController = class TaskController {
      constructor({
        priority
      }) {
        this.signal = {
          _controller: this,
          priority
        };
      }
      abort() {
        const task = this |> taskQueue.get(%);
        if (task !== undefined) {
          this |> taskQueue.delete(%);
          const reject = task.reject;
          new Error('Aborted') |> reject(%);
        }
      }
    };
    function ensureLogIsEmpty() {
      if (eventLog.length !== 0) {
        throw 'Log is not empty. Call assertLog before continuing.' |> Error(%);
      }
    }
    function advanceTime(ms) {
      currentTime += ms;
    }
    function flushTasks() {
      ensureLogIsEmpty();

      // If there's a continuation, it will call postTask again
      // which will set nextTask. That means we need to clear
      // nextTask before the invocation, otherwise we would
      // delete the continuation task.
      const prevTaskQueue = taskQueue;
      taskQueue = new Map();
      for (const [, {
        id,
        callback,
        resolve
      }] of prevTaskQueue) {
        `Task ${id} Fired` |> log(%);
        false |> callback(%);
        resolve();
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
      flushTasks,
      log,
      isLogEmpty,
      assertLog
    };
  }
  'task that finishes before deadline' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'A'] |> runtime.assertLog(%);
  });
  'task with continuation' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
      while (!Scheduler.unstable_shouldYield()) {
        1 |> runtime.advanceTime(%);
      }
      `Yield at ${performance.now()}ms` |> runtime.log(%);
      return () => {
        'Continuation' |> runtime.log(%);
      };
    });
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'A', 'Yield at 5ms', 'Yield 1 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 1 Fired', 'Continuation'] |> runtime.assertLog(%);
  });
  'multiple tasks' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]', 'Post Task 1 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'A', 'Task 1 Fired', 'B'] |> runtime.assertLog(%);
  });
  'cancels tasks' |> it(%, () => {
    const task = NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    task |> cancelCallback(%);
    runtime.flushTasks();
    [] |> runtime.assertLog(%);
  });
  'an error in one task does not affect execution of other tasks' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      throw 'Oops!' |> Error(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'Yay' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]', 'Post Task 1 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'Error: Oops!', 'Task 1 Fired', 'Yay'] |> runtime.assertLog(%);
  });
  'schedule new task after queue has emptied' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'A'] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Task 1 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 1 Fired', 'B'] |> runtime.assertLog(%);
  });
  'schedule new task after a cancellation' |> it(%, () => {
    const handle = NormalPriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    handle |> cancelCallback(%);
    runtime.flushTasks();
    [] |> runtime.assertLog(%);
    NormalPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    ['Post Task 1 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 1 Fired', 'B'] |> runtime.assertLog(%);
  });
  'schedules tasks at different priorities' |> it(%, () => {
    ImmediatePriority |> scheduleCallback(%, () => {
      'A' |> runtime.log(%);
    });
    UserBlockingPriority |> scheduleCallback(%, () => {
      'B' |> runtime.log(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      'C' |> runtime.log(%);
    });
    LowPriority |> scheduleCallback(%, () => {
      'D' |> runtime.log(%);
    });
    IdlePriority |> scheduleCallback(%, () => {
      'E' |> runtime.log(%);
    });
    ['Post Task 0 [user-blocking]', 'Post Task 1 [user-blocking]', 'Post Task 2 [user-visible]', 'Post Task 3 [user-visible]', 'Post Task 4 [background]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    ['Task 0 Fired', 'A', 'Task 1 Fired', 'B', 'Task 2 Fired', 'C', 'Task 3 Fired', 'D', 'Task 4 Fired', 'E'] |> runtime.assertLog(%);
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
    ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
    runtime.flushTasks();
    // No time has elapsed
    ['Task 0 Fired', 'Original Task',
    // Immediately before returning a continuation, `shouldYield` returns
    // false, which means there must be time remaining in the frame.
    'shouldYield: false', 'Return a continuation',
    // The continuation should be scheduled in a separate macrotask even
    // though there's time remaining.
    'Yield 1 [user-visible]'] |> runtime.assertLog(%);
    0 |> (performance.now() |> expect(%)).toBe(%);
    runtime.flushTasks();
    ['Task 1 Fired', 'Continuation Task'] |> runtime.assertLog(%);
  });
  'falls back to postTask for scheduling continuations when scheduler.yield is not available' |> describe(%, () => {
    (() => {
      delete global.scheduler.yield;
    }) |> beforeEach(%);
    'task with continuation' |> it(%, () => {
      NormalPriority |> scheduleCallback(%, () => {
        'A' |> runtime.log(%);
        while (!Scheduler.unstable_shouldYield()) {
          1 |> runtime.advanceTime(%);
        }
        `Yield at ${performance.now()}ms` |> runtime.log(%);
        return () => {
          'Continuation' |> runtime.log(%);
        };
      });
      ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
      runtime.flushTasks();
      ['Task 0 Fired', 'A', 'Yield at 5ms', 'Post Task 1 [user-visible]'] |> runtime.assertLog(%);
      runtime.flushTasks();
      ['Task 1 Fired', 'Continuation'] |> runtime.assertLog(%);
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
      ['Post Task 0 [user-visible]'] |> runtime.assertLog(%);
      runtime.flushTasks();
      // No time has elapsed
      ['Task 0 Fired', 'Original Task',
      // Immediately before returning a continuation, `shouldYield` returns
      // false, which means there must be time remaining in the frame.
      'shouldYield: false', 'Return a continuation',
      // The continuation should be scheduled in a separate macrotask even
      // though there's time remaining.
      'Post Task 1 [user-visible]'] |> runtime.assertLog(%);
      0 |> (performance.now() |> expect(%)).toBe(%);
      runtime.flushTasks();
      ['Task 1 Fired', 'Continuation Task'] |> runtime.assertLog(%);
    });
  });
});