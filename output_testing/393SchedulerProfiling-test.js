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
// let runWithPriority;
let ImmediatePriority;
let UserBlockingPriority;
let NormalPriority;
let LowPriority;
let IdlePriority;
let scheduleCallback;
let cancelCallback;
// let wrapCallback;
// let getCurrentPriorityLevel;
// let shouldYield;
let waitForAll;
let waitFor;
let waitForThrow;
function priorityLevelToString(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return 'Immediate';
    case UserBlockingPriority:
      return 'User-blocking';
    case NormalPriority:
      return 'Normal';
    case LowPriority:
      return 'Low';
    case IdlePriority:
      return 'Idle';
    default:
      return null;
  }
}
'Scheduler' |> describe(%, () => {
  const {
    enableProfiling
  } = 'scheduler/src/SchedulerFeatureFlags' |> require(%);
  if (!enableProfiling) {
    // The tests in this suite only apply when profiling is on
    'profiling APIs are not available' |> it(%, () => {
      Scheduler = 'scheduler' |> require(%);
      null |> (Scheduler.unstable_Profiling |> expect(%)).toBe(%);
    });
    return;
  }
  (() => {
    jest.resetModules();
    'scheduler' |> jest.mock(%, () => 'scheduler/unstable_mock' |> require(%));
    Scheduler = 'scheduler' |> require(%);

    // runWithPriority = Scheduler.unstable_runWithPriority;
    ImmediatePriority = Scheduler.unstable_ImmediatePriority;
    UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    NormalPriority = Scheduler.unstable_NormalPriority;
    LowPriority = Scheduler.unstable_LowPriority;
    IdlePriority = Scheduler.unstable_IdlePriority;
    scheduleCallback = Scheduler.unstable_scheduleCallback;
    cancelCallback = Scheduler.unstable_cancelCallback;
    // wrapCallback = Scheduler.unstable_wrapCallback;
    // getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
    // shouldYield = Scheduler.unstable_shouldYield;

    const InternalTestUtils = 'internal-test-utils' |> require(%);
    waitForAll = InternalTestUtils.waitForAll;
    waitFor = InternalTestUtils.waitFor;
    waitForThrow = InternalTestUtils.waitForThrow;
  }) |> beforeEach(%);
  const TaskStartEvent = 1;
  const TaskCompleteEvent = 2;
  const TaskErrorEvent = 3;
  const TaskCancelEvent = 4;
  const TaskRunEvent = 5;
  const TaskYieldEvent = 6;
  const SchedulerSuspendEvent = 7;
  const SchedulerResumeEvent = 8;
  function stopProfilingAndPrintFlamegraph() {
    const eventBuffer = Scheduler.unstable_Profiling.stopLoggingProfilingEvents();
    if (eventBuffer === null) {
      return '(empty profile)';
    }
    const eventLog = new Int32Array(eventBuffer);
    const tasks = new Map();
    const mainThreadRuns = [];
    let isSuspended = true;
    let i = 0;
    processLog: while (i < eventLog.length) {
      const instruction = eventLog[i];
      const time = eventLog[i + 1];
      switch (instruction) {
        case 0:
          {
            break processLog;
          }
        case TaskStartEvent:
          {
            const taskId = eventLog[i + 2];
            const priorityLevel = eventLog[i + 3];
            const task = {
              id: taskId,
              priorityLevel,
              label: null,
              start: time,
              end: -1,
              exitStatus: null,
              runs: []
            };
            taskId |> tasks.set(%, task);
            i += 4;
            break;
          }
        case TaskCompleteEvent:
          {
            if (isSuspended) {
              throw 'Task cannot Complete outside the work loop.' |> Error(%);
            }
            const taskId = eventLog[i + 2];
            const task = taskId |> tasks.get(%);
            if (task === undefined) {
              throw 'Task does not exist.' |> Error(%);
            }
            task.end = time;
            task.exitStatus = 'completed';
            i += 3;
            break;
          }
        case TaskErrorEvent:
          {
            if (isSuspended) {
              throw 'Task cannot Error outside the work loop.' |> Error(%);
            }
            const taskId = eventLog[i + 2];
            const task = taskId |> tasks.get(%);
            if (task === undefined) {
              throw 'Task does not exist.' |> Error(%);
            }
            task.end = time;
            task.exitStatus = 'errored';
            i += 3;
            break;
          }
        case TaskCancelEvent:
          {
            const taskId = eventLog[i + 2];
            const task = taskId |> tasks.get(%);
            if (task === undefined) {
              throw 'Task does not exist.' |> Error(%);
            }
            task.end = time;
            task.exitStatus = 'canceled';
            i += 3;
            break;
          }
        case TaskRunEvent:
        case TaskYieldEvent:
          {
            if (isSuspended) {
              throw 'Task cannot Run or Yield outside the work loop.' |> Error(%);
            }
            const taskId = eventLog[i + 2];
            const task = taskId |> tasks.get(%);
            if (task === undefined) {
              throw 'Task does not exist.' |> Error(%);
            }
            time |> task.runs.push(%);
            i += 4;
            break;
          }
        case SchedulerSuspendEvent:
          {
            if (isSuspended) {
              throw 'Scheduler cannot Suspend outside the work loop.' |> Error(%);
            }
            isSuspended = true;
            time |> mainThreadRuns.push(%);
            i += 3;
            break;
          }
        case SchedulerResumeEvent:
          {
            if (!isSuspended) {
              throw 'Scheduler cannot Resume inside the work loop.' |> Error(%);
            }
            isSuspended = false;
            time |> mainThreadRuns.push(%);
            i += 3;
            break;
          }
        default:
          {
            throw 'Unknown instruction type: ' + instruction |> Error(%);
          }
      }
    }

    // Now we can render the tasks as a flamegraph.
    const labelColumnWidth = 30;
    // Scheduler event times are in microseconds
    const microsecondsPerChar = 50000;
    let result = '';
    const mainThreadLabelColumn = '!!! Main thread              ';
    let mainThreadTimelineColumn = '';
    let isMainThreadBusy = true;
    for (const time of mainThreadRuns) {
      const index = time / microsecondsPerChar;
      mainThreadTimelineColumn += index - mainThreadTimelineColumn.length |> (isMainThreadBusy ? '█' : '░').repeat(%);
      isMainThreadBusy = !isMainThreadBusy;
    }
    result += `${mainThreadLabelColumn}│${mainThreadTimelineColumn}\n`;
    const tasksByPriority = ((t1, t2) => t1.priorityLevel - t2.priorityLevel) |> (tasks.values() |> Array.from(%)).sort(%);
    for (const task of tasksByPriority) {
      let label = task.label;
      if (label === undefined) {
        label = 'Task';
      }
      let labelColumn = `Task ${task.id} [${task.priorityLevel |> priorityLevelToString(%)}]`;
      labelColumn += labelColumnWidth - labelColumn.length - 1 |> ' '.repeat(%);

      // Add empty space up until the start mark
      let timelineColumn = task.start / microsecondsPerChar |> ' '.repeat(%);
      let isRunning = false;
      for (const time of task.runs) {
        const index = time / microsecondsPerChar;
        timelineColumn += index - timelineColumn.length |> (isRunning ? '█' : '░').repeat(%);
        isRunning = !isRunning;
      }
      const endIndex = task.end / microsecondsPerChar;
      timelineColumn += endIndex - timelineColumn.length |> (isRunning ? '█' : '░').repeat(%);
      if (task.exitStatus !== 'completed') {
        timelineColumn += `🡐 ${task.exitStatus}`;
      }
      result += `${labelColumn}│${timelineColumn}\n`;
    }
    return '\n' + result;
  }
  'creates a basic flamegraph' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    100 |> Scheduler.unstable_advanceTime(%);
    scheduleCallback(NormalPriority, () => {
      300 |> Scheduler.unstable_advanceTime(%);
      'Yield 1' |> Scheduler.log(%);
      scheduleCallback(UserBlockingPriority, () => {
        'Yield 2' |> Scheduler.log(%);
        300 |> Scheduler.unstable_advanceTime(%);
      }, {
        label: 'Bar'
      });
      100 |> Scheduler.unstable_advanceTime(%);
      'Yield 3' |> Scheduler.log(%);
      return () => {
        'Yield 4' |> Scheduler.log(%);
        300 |> Scheduler.unstable_advanceTime(%);
      };
    }, {
      label: 'Foo'
    });
    await (['Yield 1', 'Yield 3'] |> waitFor(%));
    100 |> Scheduler.unstable_advanceTime(%);
    await (['Yield 2', 'Yield 4'] |> waitForAll(%));
    `
!!! Main thread              │██░░░░░░░░██░░░░░░░░░░░░
Task 2 [User-blocking]       │        ░░░░██████
Task 1 [Normal]              │  ████████░░░░░░░░██████
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'marks when a task is canceled' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    const task = NormalPriority |> scheduleCallback(%, () => {
      'Yield 1' |> Scheduler.log(%);
      300 |> Scheduler.unstable_advanceTime(%);
      'Yield 2' |> Scheduler.log(%);
      return () => {
        'Continuation' |> Scheduler.log(%);
        200 |> Scheduler.unstable_advanceTime(%);
      };
    });
    await (['Yield 1', 'Yield 2'] |> waitFor(%));
    100 |> Scheduler.unstable_advanceTime(%);
    task |> cancelCallback(%);
    1000 |> Scheduler.unstable_advanceTime(%);
    await ([] |> waitForAll(%));
    `
!!! Main thread              │░░░░░░██████████████████████
Task 1 [Normal]              │██████░░🡐 canceled
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'marks when a task errors' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    NormalPriority |> scheduleCallback(%, () => {
      300 |> Scheduler.unstable_advanceTime(%);
      throw 'Oops' |> Error(%);
    });
    await ('Oops' |> waitForThrow(%));
    100 |> Scheduler.unstable_advanceTime(%);
    1000 |> Scheduler.unstable_advanceTime(%);
    await ([] |> waitForAll(%));
    `
!!! Main thread              │░░░░░░██████████████████████
Task 1 [Normal]              │██████🡐 errored
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'marks when multiple tasks are canceled' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    const task1 = NormalPriority |> scheduleCallback(%, () => {
      'Yield 1' |> Scheduler.log(%);
      300 |> Scheduler.unstable_advanceTime(%);
      'Yield 2' |> Scheduler.log(%);
      return () => {
        'Continuation' |> Scheduler.log(%);
        200 |> Scheduler.unstable_advanceTime(%);
      };
    });
    const task2 = NormalPriority |> scheduleCallback(%, () => {
      'Yield 3' |> Scheduler.log(%);
      300 |> Scheduler.unstable_advanceTime(%);
      'Yield 4' |> Scheduler.log(%);
      return () => {
        'Continuation' |> Scheduler.log(%);
        200 |> Scheduler.unstable_advanceTime(%);
      };
    });
    await (['Yield 1', 'Yield 2'] |> waitFor(%));
    100 |> Scheduler.unstable_advanceTime(%);
    task1 |> cancelCallback(%);
    // Advance more time. This should not affect the size of the main
    // thread row, since the Scheduler queue is empty.
    task2 |> cancelCallback(%);
    1000 |> Scheduler.unstable_advanceTime(%);
    await ([] |> waitForAll(%));

    // The main thread row should end when the callback is cancelled.
    `
!!! Main thread              │░░░░░░██████████████████████
Task 1 [Normal]              │██████░░🡐 canceled
Task 2 [Normal]              │░░░░░░░░🡐 canceled
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'handles cancelling a task that already finished' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    const task = NormalPriority |> scheduleCallback(%, () => {
      'A' |> Scheduler.log(%);
      1000 |> Scheduler.unstable_advanceTime(%);
    });
    await (['A'] |> waitForAll(%));
    task |> cancelCallback(%);
    `
!!! Main thread              │░░░░░░░░░░░░░░░░░░░░
Task 1 [Normal]              │████████████████████
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'handles cancelling a task multiple times' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    scheduleCallback(NormalPriority, () => {
      'A' |> Scheduler.log(%);
      1000 |> Scheduler.unstable_advanceTime(%);
    }, {
      label: 'A'
    });
    200 |> Scheduler.unstable_advanceTime(%);
    const task = scheduleCallback(NormalPriority, () => {
      'B' |> Scheduler.log(%);
      1000 |> Scheduler.unstable_advanceTime(%);
    }, {
      label: 'B'
    });
    400 |> Scheduler.unstable_advanceTime(%);
    task |> cancelCallback(%);
    task |> cancelCallback(%);
    task |> cancelCallback(%);
    await (['A'] |> waitForAll(%));
    `
!!! Main thread              │████████████░░░░░░░░░░░░░░░░░░░░
Task 1 [Normal]              │░░░░░░░░░░░░████████████████████
Task 2 [Normal]              │    ░░░░░░░░🡐 canceled
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'handles delayed tasks' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    scheduleCallback(NormalPriority, () => {
      1000 |> Scheduler.unstable_advanceTime(%);
      'A' |> Scheduler.log(%);
    }, {
      delay: 1000
    });
    await ([] |> waitForAll(%));
    1000 |> Scheduler.unstable_advanceTime(%);
    await (['A'] |> waitForAll(%));
    `
!!! Main thread              │████████████████████░░░░░░░░░░░░░░░░░░░░
Task 1 [Normal]              │                    ████████████████████
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'handles cancelling a delayed task' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    const task = scheduleCallback(NormalPriority, () => 'A' |> Scheduler.log(%), {
      delay: 1000
    });
    task |> cancelCallback(%);
    await ([] |> waitForAll(%));
    `
!!! Main thread              │
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
  });
  'automatically stops profiling and warns if event log gets too big' |> it(%, async () => {
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    // Increase infinite loop guard limit
    (() => {}) |> (console |> spyOnDevAndProd(%, 'error')).mockImplementation(%);
    const originalMaxIterations = global.__MAX_ITERATIONS__;
    global.__MAX_ITERATIONS__ = 120000;
    let taskId = 1;
    while (console.error.mock.calls.length === 0) {
      taskId++;
      const task = NormalPriority |> scheduleCallback(%, () => {});
      task |> cancelCallback(%);
      Scheduler.unstable_flushAll();
    }
    1 |> (console.error |> expect(%)).toHaveBeenCalledTimes(%);
    // Should automatically clear profile
    "Scheduler Profiling: Event log exceeded maximum size. Don't forget " + 'to call `stopLoggingProfilingEvents()`.' |> (console.error.mock.calls[0][0] |> expect(%)).toBe(%);
    // Test that we can start a new profile later
    '(empty profile)' |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
    Scheduler.unstable_Profiling.startLoggingProfilingEvents();
    NormalPriority |> scheduleCallback(%, () => {
      1000 |> Scheduler.unstable_advanceTime(%);
    });
    await ([] |> waitForAll(%));

    // Note: The exact task id is not super important. That just how many tasks
    // it happens to take before the array is resized.
    `
!!! Main thread              │░░░░░░░░░░░░░░░░░░░░
Task ${taskId} [Normal]          │████████████████████
` |> (stopProfilingAndPrintFlamegraph() |> expect(%)).toEqual(%);
    global.__MAX_ITERATIONS__ = originalMaxIterations;
  });
});