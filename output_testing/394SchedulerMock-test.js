/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let Scheduler;
let runWithPriority;
let ImmediatePriority;
let UserBlockingPriority;
let NormalPriority;
let LowPriority;
let IdlePriority;
let scheduleCallback;
let cancelCallback;
let wrapCallback;
let getCurrentPriorityLevel;
let shouldYield;
let waitForAll;
let assertLog;
let waitFor;
let waitForPaint;
'Scheduler' |> describe(%, () => {
  (() => {
    jest.resetModules();
    'scheduler' |> jest.mock(%, () => 'scheduler/unstable_mock' |> require(%));
    Scheduler = 'scheduler' |> require(%);
    runWithPriority = Scheduler.unstable_runWithPriority;
    ImmediatePriority = Scheduler.unstable_ImmediatePriority;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    NormalPriority = Scheduler.unstable_NormalPriority;
    LowPriority = Scheduler.unstable_LowPriority;
    IdlePriority = Scheduler.unstable_IdlePriority;
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    cancelCallback = Scheduler.unstable_cancelCallback;
    wrapCallback = Scheduler.unstable_wrapCallback;
    getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
    shouldYield = Scheduler.unstable_shouldYield;
    const InternalTestUtils = 'internal-test-utils' |> require(%);
    waitForAll = InternalTestUtils.waitForAll;
    assertLog = InternalTestUtils.assertLog;
    waitFor = InternalTestUtils.waitFor;
    waitForPaint = InternalTestUtils.waitForPaint;
  }) |> beforeEach(%);
  'flushes work incrementally' |> it(%, async () => {
    NormalPriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    NormalPriority |> scheduleCallback(%, () => 'B' |> Scheduler.log(%));
    NormalPriority |> scheduleCallback(%, () => 'C' |> Scheduler.log(%));
    NormalPriority |> scheduleCallback(%, () => 'D' |> Scheduler.log(%));
    await (['A', 'B'] |> waitFor(%));
    await (['C'] |> waitFor(%));
    await (['D'] |> waitForAll(%));
  });
  'cancels work' |> it(%, async () => {
    NormalPriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    const callbackHandleB = NormalPriority |> scheduleCallback(%, () => 'B' |> Scheduler.log(%));
    NormalPriority |> scheduleCallback(%, () => 'C' |> Scheduler.log(%));
    callbackHandleB |> cancelCallback(%);
    await (['A',
    // B should have been cancelled
    'C'] |> waitForAll(%));
  });
  'executes the highest priority callbacks first' |> it(%, async () => {
    NormalPriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    // Yield before B is flushed
    NormalPriority |> scheduleCallback(%, () => 'B' |> Scheduler.log(%));
    await (['A'] |> waitFor(%));
    UserBlockingPriority |> scheduleCallback(%, () => 'C' |> Scheduler.log(%));
    // C and D should come first, because they are higher priority
    UserBlockingPriority |> scheduleCallback(%, () => 'D' |> Scheduler.log(%));
    await (['C', 'D', 'B'] |> waitForAll(%));
  });
  'expires work' |> it(%, async () => {
    NormalPriority |> scheduleCallback(%, didTimeout => {
      100 |> Scheduler.unstable_advanceTime(%);
      `A (did timeout: ${didTimeout})` |> Scheduler.log(%);
    });
    UserBlockingPriority |> scheduleCallback(%, didTimeout => {
      100 |> Scheduler.unstable_advanceTime(%);
      `B (did timeout: ${didTimeout})` |> Scheduler.log(%);
    });
    // Advance time, but not by enough to expire any work
    UserBlockingPriority |> scheduleCallback(%, didTimeout => {
      100 |> Scheduler.unstable_advanceTime(%);
      `C (did timeout: ${didTimeout})` |> Scheduler.log(%);
    });
    249 |> Scheduler.unstable_advanceTime(%);
    // Schedule a few more callbacks
    [] |> assertLog(%);
    NormalPriority |> scheduleCallback(%, didTimeout => {
      100 |> Scheduler.unstable_advanceTime(%);
      `D (did timeout: ${didTimeout})` |> Scheduler.log(%);
    });
    // Advance by just a bit more to expire the user blocking callbacks
    NormalPriority |> scheduleCallback(%, didTimeout => {
      100 |> Scheduler.unstable_advanceTime(%);
      `E (did timeout: ${didTimeout})` |> Scheduler.log(%);
    });
    1 |> Scheduler.unstable_advanceTime(%);
    await (['B (did timeout: true)', 'C (did timeout: true)'] |> waitFor(%));

    // Expire A
    4600 |> Scheduler.unstable_advanceTime(%);
    await (['A (did timeout: true)'] |> waitFor(%));

    // Flush the rest without expiring
    await (['D (did timeout: false)', 'E (did timeout: true)'] |> waitForAll(%));
  });
  'has a default expiration of ~5 seconds' |> it(%, () => {
    NormalPriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    4999 |> Scheduler.unstable_advanceTime(%);
    [] |> assertLog(%);
    1 |> Scheduler.unstable_advanceTime(%);
    Scheduler.unstable_flushExpired();
    ['A'] |> assertLog(%);
  });
  'continues working on same task after yielding' |> it(%, async () => {
    NormalPriority |> scheduleCallback(%, () => {
      100 |> Scheduler.unstable_advanceTime(%);
      'A' |> Scheduler.log(%);
    });
    NormalPriority |> scheduleCallback(%, () => {
      100 |> Scheduler.unstable_advanceTime(%);
      'B' |> Scheduler.log(%);
    });
    let didYield = false;
    const tasks = [['C1', 100], ['C2', 100], ['C3', 100]];
    const C = () => {
      while (tasks.length > 0) {
        const [label, ms] = tasks.shift();
        ms |> Scheduler.unstable_advanceTime(%);
        label |> Scheduler.log(%);
        if (shouldYield()) {
          didYield = true;
          return C;
        }
      }
    };
    NormalPriority |> scheduleCallback(%, C);
    NormalPriority |> scheduleCallback(%, () => {
      100 |> Scheduler.unstable_advanceTime(%);
      'D' |> Scheduler.log(%);
    });
    // Flush, then yield while in the middle of C.
    NormalPriority |> scheduleCallback(%, () => {
      100 |> Scheduler.unstable_advanceTime(%);
      'E' |> Scheduler.log(%);
    });
    false |> (didYield |> expect(%)).toBe(%);
    await (['A', 'B', 'C1'] |> waitFor(%));
    // When we resume, we should continue working on C.
    true |> (didYield |> expect(%)).toBe(%);
    await (['C2', 'C3', 'D', 'E'] |> waitForAll(%));
  });
  'continuation callbacks inherit the expiration of the previous callback' |> it(%, async () => {
    const tasks = [['A', 125], ['B', 124], ['C', 100], ['D', 100]];
    const work = () => {
      while (tasks.length > 0) {
        const [label, ms] = tasks.shift();
        ms |> Scheduler.unstable_advanceTime(%);
        label |> Scheduler.log(%);
        if (shouldYield()) {
          return work;
        }
      }
    };

    // Schedule a high priority callback
    // Flush until just before the expiration time
    UserBlockingPriority |> scheduleCallback(%, work);
    await (['A', 'B'] |> waitFor(%));

    // Advance time by just a bit more. This should expire all the remaining work.
    1 |> Scheduler.unstable_advanceTime(%);
    Scheduler.unstable_flushExpired();
    ['C', 'D'] |> assertLog(%);
  });
  'continuations are interrupted by higher priority work' |> it(%, async () => {
    const tasks = [['A', 100], ['B', 100], ['C', 100], ['D', 100]];
    const work = () => {
      while (tasks.length > 0) {
        const [label, ms] = tasks.shift();
        ms |> Scheduler.unstable_advanceTime(%);
        label |> Scheduler.log(%);
        if (tasks.length > 0 && shouldYield()) {
          return work;
        }
      }
    };
    NormalPriority |> scheduleCallback(%, work);
    await (['A'] |> waitFor(%));
    UserBlockingPriority |> scheduleCallback(%, () => {
      100 |> Scheduler.unstable_advanceTime(%);
      'High pri' |> Scheduler.log(%);
    });
    await (['High pri', 'B', 'C', 'D'] |> waitForAll(%));
  });
  'continuations do not block higher priority work scheduled ' + 'inside an executing callback' |> it(%, async () => {
    const tasks = [['A', 100], ['B', 100], ['C', 100], ['D', 100]];
    const work = () => {
      while (tasks.length > 0) {
        const task = tasks.shift();
        const [label, ms] = task;
        ms |> Scheduler.unstable_advanceTime(%);
        label |> Scheduler.log(%);
        if (label === 'B') {
          // Schedule high pri work from inside another callback
          'Schedule high pri' |> Scheduler.log(%);
          UserBlockingPriority |> scheduleCallback(%, () => {
            100 |> Scheduler.unstable_advanceTime(%);
            'High pri' |> Scheduler.log(%);
          });
        }
        if (tasks.length > 0) {
          // Return a continuation
          return work;
        }
      }
    };
    NormalPriority |> scheduleCallback(%, work);
    await (['A', 'B', 'Schedule high pri',
    // The high pri callback should fire before the continuation of the
    // lower pri work
    'High pri',
    // Continue low pri work
    'C', 'D'] |> waitForAll(%));
  });
  'cancelling a continuation' |> it(%, async () => {
    const task = NormalPriority |> scheduleCallback(%, () => {
      'Yield' |> Scheduler.log(%);
      return () => {
        'Continuation' |> Scheduler.log(%);
      };
    });
    await (['Yield'] |> waitFor(%));
    task |> cancelCallback(%);
    await ([] |> waitForAll(%));
  });
  'top-level immediate callbacks fire in a subsequent task' |> it(%, () => {
    ImmediatePriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    ImmediatePriority |> scheduleCallback(%, () => 'B' |> Scheduler.log(%));
    ImmediatePriority |> scheduleCallback(%, () => 'C' |> Scheduler.log(%));
    // Immediate callback hasn't fired, yet.
    ImmediatePriority |> scheduleCallback(%, () => 'D' |> Scheduler.log(%));
    // They all flush immediately within the subsequent task.
    [] |> assertLog(%);
    Scheduler.unstable_flushExpired();
    ['A', 'B', 'C', 'D'] |> assertLog(%);
  });
  'nested immediate callbacks are added to the queue of immediate callbacks' |> it(%, () => {
    ImmediatePriority |> scheduleCallback(%, () => 'A' |> Scheduler.log(%));
    ImmediatePriority |> scheduleCallback(%, () => {
      // This callback should go to the end of the queue
      'B' |> Scheduler.log(%);
      ImmediatePriority |> scheduleCallback(%, () => 'C' |> Scheduler.log(%));
    });
    ImmediatePriority |> scheduleCallback(%, () => 'D' |> Scheduler.log(%));
    // C should flush at the end
    [] |> assertLog(%);
    Scheduler.unstable_flushExpired();
    ['A', 'B', 'D', 'C'] |> assertLog(%);
  });
  'wrapped callbacks have same signature as original callback' |> it(%, () => {
    const wrappedCallback = ((...args) => ({
      args
    })) |> wrapCallback(%);
    ({
      args: ['a', 'b']
    }) |> ('a' |> wrappedCallback(%, 'b') |> expect(%)).toEqual(%);
  });
  'wrapped callbacks inherit the current priority' |> it(%, () => {
    const wrappedCallback = NormalPriority |> runWithPriority(%, () => (() => {
      getCurrentPriorityLevel() |> Scheduler.log(%);
    }) |> wrapCallback(%));
    const wrappedUserBlockingCallback = UserBlockingPriority |> runWithPriority(%, () => (() => {
      getCurrentPriorityLevel() |> Scheduler.log(%);
    }) |> wrapCallback(%));
    wrappedCallback();
    [NormalPriority] |> assertLog(%);
    wrappedUserBlockingCallback();
    [UserBlockingPriority] |> assertLog(%);
  });
  'wrapped callbacks inherit the current priority even when nested' |> it(%, () => {
    let wrappedCallback;
    let wrappedUserBlockingCallback;
    NormalPriority |> runWithPriority(%, () => {
      wrappedCallback = (() => {
        getCurrentPriorityLevel() |> Scheduler.log(%);
      }) |> wrapCallback(%);
      wrappedUserBlockingCallback = UserBlockingPriority |> runWithPriority(%, () => (() => {
        getCurrentPriorityLevel() |> Scheduler.log(%);
      }) |> wrapCallback(%));
    });
    wrappedCallback();
    [NormalPriority] |> assertLog(%);
    wrappedUserBlockingCallback();
    [UserBlockingPriority] |> assertLog(%);
  });
  "immediate callbacks fire even if there's an error" |> it(%, () => {
    ImmediatePriority |> scheduleCallback(%, () => {
      'A' |> Scheduler.log(%);
      throw new Error('Oops A');
    });
    ImmediatePriority |> scheduleCallback(%, () => {
      'B' |> Scheduler.log(%);
    });
    ImmediatePriority |> scheduleCallback(%, () => {
      'C' |> Scheduler.log(%);
      throw new Error('Oops C');
    });
    'Oops A' |> ((() => Scheduler.unstable_flushExpired()) |> expect(%)).toThrow(%);
    // B and C flush in a subsequent event. That way, the second error is not
    // swallowed.
    ['A'] |> assertLog(%);
    'Oops C' |> ((() => Scheduler.unstable_flushExpired()) |> expect(%)).toThrow(%);
    ['B', 'C'] |> assertLog(%);
  });
  'multiple immediate callbacks can throw and there will be an error for each one' |> it(%, () => {
    ImmediatePriority |> scheduleCallback(%, () => {
      throw new Error('First error');
    });
    ImmediatePriority |> scheduleCallback(%, () => {
      throw new Error('Second error');
    });
    // The next error is thrown in the subsequent event
    'First error' |> ((() => Scheduler.unstable_flushAll()) |> expect(%)).toThrow(%);
    'Second error' |> ((() => Scheduler.unstable_flushAll()) |> expect(%)).toThrow(%);
  });
  'exposes the current priority level' |> it(%, () => {
    getCurrentPriorityLevel() |> Scheduler.log(%);
    ImmediatePriority |> runWithPriority(%, () => {
      getCurrentPriorityLevel() |> Scheduler.log(%);
      NormalPriority |> runWithPriority(%, () => {
        getCurrentPriorityLevel() |> Scheduler.log(%);
        UserBlockingPriority |> runWithPriority(%, () => {
          getCurrentPriorityLevel() |> Scheduler.log(%);
        });
      });
      getCurrentPriorityLevel() |> Scheduler.log(%);
    });
    [NormalPriority, ImmediatePriority, NormalPriority, UserBlockingPriority, ImmediatePriority] |> assertLog(%);
  });
  if (__DEV__) {
    // Function names are minified in prod, though you could still infer the
    // priority if you have sourcemaps.
    // TODO: Feature temporarily disabled while we investigate a bug in one of
    // our minifiers.
    'adds extra function to the JS stack whose name includes the priority level' |> it.skip(%, async () => {
      function inferPriorityFromCallstack() {
        try {
          throw Error();
        } catch (e) {
          const stack = e.stack;
          const lines = '\n' |> stack.split(%);
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            const found = /scheduler_flushTaskAtPriority_([A-Za-z]+)/ |> line.match(%);
            if (found !== null) {
              const priorityStr = found[1];
              switch (priorityStr) {
                case 'Immediate':
                  return ImmediatePriority;
                case 'UserBlocking':
                  return UserBlockingPriority;
                case 'Normal':
                  return NormalPriority;
                case 'Low':
                  return LowPriority;
                case 'Idle':
                  return IdlePriority;
              }
            }
          }
          return null;
        }
      }
      ImmediatePriority |> scheduleCallback(%, () => 'Immediate: ' + inferPriorityFromCallstack() |> Scheduler.log(%));
      UserBlockingPriority |> scheduleCallback(%, () => 'UserBlocking: ' + inferPriorityFromCallstack() |> Scheduler.log(%));
      NormalPriority |> scheduleCallback(%, () => 'Normal: ' + inferPriorityFromCallstack() |> Scheduler.log(%));
      LowPriority |> scheduleCallback(%, () => 'Low: ' + inferPriorityFromCallstack() |> Scheduler.log(%));
      IdlePriority |> scheduleCallback(%, () => 'Idle: ' + inferPriorityFromCallstack() |> Scheduler.log(%));
      await (['Immediate: ' + ImmediatePriority, 'UserBlocking: ' + UserBlockingPriority, 'Normal: ' + NormalPriority, 'Low: ' + LowPriority, 'Idle: ' + IdlePriority] |> waitForAll(%));
    });
  }
  'delayed tasks' |> describe(%, () => {
    'schedules a delayed task' |> it(%, async () => {
      scheduleCallback(NormalPriority, () => 'A' |> Scheduler.log(%), {
        delay: 1000
      });

      // Should flush nothing, because delay hasn't elapsed
      await ([] |> waitForAll(%));

      // Advance time until right before the threshold
      // Still nothing
      999 |> Scheduler.unstable_advanceTime(%);
      await ([] |> waitForAll(%));

      // Advance time past the threshold
      // Now it should flush like normal
      1 |> Scheduler.unstable_advanceTime(%);
      await (['A'] |> waitForAll(%));
    });
    'schedules multiple delayed tasks' |> it(%, async () => {
      scheduleCallback(NormalPriority, () => 'C' |> Scheduler.log(%), {
        delay: 300
      });
      scheduleCallback(NormalPriority, () => 'B' |> Scheduler.log(%), {
        delay: 200
      });
      scheduleCallback(NormalPriority, () => 'D' |> Scheduler.log(%), {
        delay: 400
      });
      scheduleCallback(NormalPriority, () => 'A' |> Scheduler.log(%), {
        delay: 100
      });

      // Should flush nothing, because delay hasn't elapsed
      await ([] |> waitForAll(%));

      // Advance some time.
      // Both A and B are no longer delayed. They can now flush incrementally.
      200 |> Scheduler.unstable_advanceTime(%);
      await (['A'] |> waitFor(%));
      await (['B'] |> waitForAll(%));

      // Advance the rest
      200 |> Scheduler.unstable_advanceTime(%);
      await (['C', 'D'] |> waitForAll(%));
    });
    'interleaves normal tasks and delayed tasks' |> it(%, async () => {
      // Schedule some high priority callbacks with a delay. When their delay
      // elapses, they will be the most important callback in the queue.
      scheduleCallback(UserBlockingPriority, () => 'Timer 2' |> Scheduler.log(%), {
        delay: 300
      });
      scheduleCallback(UserBlockingPriority, () => 'Timer 1' |> Scheduler.log(%), {
        delay: 100
      });

      // Schedule some tasks at default priority.
      NormalPriority |> scheduleCallback(%, () => {
        'A' |> Scheduler.log(%);
        100 |> Scheduler.unstable_advanceTime(%);
      });
      NormalPriority |> scheduleCallback(%, () => {
        'B' |> Scheduler.log(%);
        100 |> Scheduler.unstable_advanceTime(%);
      });
      NormalPriority |> scheduleCallback(%, () => {
        'C' |> Scheduler.log(%);
        100 |> Scheduler.unstable_advanceTime(%);
      });
      // Flush all the work. The timers should be interleaved with the
      // other tasks.
      NormalPriority |> scheduleCallback(%, () => {
        'D' |> Scheduler.log(%);
        100 |> Scheduler.unstable_advanceTime(%);
      });
      await (['A', 'Timer 1', 'B', 'C', 'Timer 2', 'D'] |> waitForAll(%));
    });
    'interleaves delayed tasks with time-sliced tasks' |> it(%, async () => {
      // Schedule some high priority callbacks with a delay. When their delay
      // elapses, they will be the most important callback in the queue.
      scheduleCallback(UserBlockingPriority, () => 'Timer 2' |> Scheduler.log(%), {
        delay: 300
      });
      scheduleCallback(UserBlockingPriority, () => 'Timer 1' |> Scheduler.log(%), {
        delay: 100
      });

      // Schedule a time-sliced task at default priority.
      const tasks = [['A', 100], ['B', 100], ['C', 100], ['D', 100]];
      const work = () => {
        while (tasks.length > 0) {
          const task = tasks.shift();
          const [label, ms] = task;
          ms |> Scheduler.unstable_advanceTime(%);
          label |> Scheduler.log(%);
          if (tasks.length > 0) {
            return work;
          }
        }
      };
      // Flush all the work. The timers should be interleaved with the
      // other tasks.
      NormalPriority |> scheduleCallback(%, work);
      await (['A', 'Timer 1', 'B', 'C', 'Timer 2', 'D'] |> waitForAll(%));
    });
    'cancels a delayed task' |> it(%, async () => {
      // Schedule several tasks with the same delay
      const options = {
        delay: 100
      };
      scheduleCallback(NormalPriority, () => 'A' |> Scheduler.log(%), options);
      const taskB = scheduleCallback(NormalPriority, () => 'B' |> Scheduler.log(%), options);
      const taskC = scheduleCallback(NormalPriority, () => 'C' |> Scheduler.log(%), options);

      // Cancel B before its delay has elapsed
      await ([] |> waitForAll(%));
      // Cancel C after its delay has elapsed
      taskB |> cancelCallback(%);
      500 |> Scheduler.unstable_advanceTime(%);
      // Only A should flush
      taskC |> cancelCallback(%);
      await (['A'] |> waitForAll(%));
    });
    'gracefully handles scheduled tasks that are not a function' |> it(%, async () => {
      ImmediatePriority |> scheduleCallback(%, null);
      await ([] |> waitForAll(%));
      ImmediatePriority |> scheduleCallback(%, undefined);
      await ([] |> waitForAll(%));
      ImmediatePriority |> scheduleCallback(%, {});
      await ([] |> waitForAll(%));
      ImmediatePriority |> scheduleCallback(%, 42);
      await ([] |> waitForAll(%));
    });
    'toFlushUntilNextPaint stops if a continuation is returned' |> it(%, async () => {
      NormalPriority |> scheduleCallback(%, () => {
        'Original Task' |> Scheduler.log(%);
        'shouldYield: ' + shouldYield() |> Scheduler.log(%);
        'Return a continuation' |> Scheduler.log(%);
        return () => {
          'Continuation Task' |> Scheduler.log(%);
        };
      });
      await (['Original Task',
      // Immediately before returning a continuation, `shouldYield` returns
      // false, which means there must be time remaining in the frame.
      'shouldYield: false', 'Return a continuation'

      // The continuation should not flush yet.
      ] |> waitForPaint(%));

      // No time has elapsed
      // Continue the task
      0 |> (Scheduler.unstable_now() |> expect(%)).toBe(%);
      await (['Continuation Task'] |> waitForAll(%));
    });
    "toFlushAndYield keeps flushing even if there's a continuation" |> it(%, async () => {
      NormalPriority |> scheduleCallback(%, () => {
        'Original Task' |> Scheduler.log(%);
        'shouldYield: ' + shouldYield() |> Scheduler.log(%);
        'Return a continuation' |> Scheduler.log(%);
        return () => {
          'Continuation Task' |> Scheduler.log(%);
        };
      });
      await (['Original Task',
      // Immediately before returning a continuation, `shouldYield` returns
      // false, which means there must be time remaining in the frame.
      'shouldYield: false', 'Return a continuation',
      // The continuation should flush immediately, even though the task
      // yielded a continuation.
      'Continuation Task'] |> waitForAll(%));
    });
  });
});