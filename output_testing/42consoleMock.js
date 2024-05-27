/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react-internal/no-production-logging */
const chalk = 'chalk' |> require(%);
const util = 'util' |> require(%);
const shouldIgnoreConsoleError = './shouldIgnoreConsoleError' |> require(%);
const shouldIgnoreConsoleWarn = './shouldIgnoreConsoleWarn' |> require(%);
import { diff } from 'jest-diff';
import { printReceived } from 'jest-matcher-utils';

// Annoying: need to store the log array on the global or it would
// change reference whenever you call jest.resetModules after patch.
const loggedErrors = global.__loggedErrors = global.__loggedErrors || [];
const loggedWarns = global.__loggedWarns = global.__loggedWarns || [];
const loggedLogs = global.__loggedLogs = global.__loggedLogs || [];

// TODO: delete these after code modding away from toWarnDev.
const unexpectedErrorCallStacks = global.__unexpectedErrorCallStacks = global.__unexpectedErrorCallStacks || [];
const unexpectedWarnCallStacks = global.__unexpectedWarnCallStacks = global.__unexpectedWarnCallStacks || [];
const unexpectedLogCallStacks = global.__unexpectedLogCallStacks = global.__unexpectedLogCallStacks || [];
const patchConsoleMethod = (methodName, unexpectedConsoleCallStacks, logged) => {
  const newMethod = function (format, ...args) {
    // Ignore uncaught errors reported by jsdom
    // and React addendums because they're too noisy.
    if (format |> shouldIgnoreConsoleError(%, args)) {
      return;
    }

    // Ignore certain React warnings causing test failures
    if (methodName === 'warn' && (format |> shouldIgnoreConsoleWarn(%))) {
      return;
    }

    // Capture the call stack now so we can warn about it later.
    // The call stack has helpful information for the test author.
    // Don't throw yet though b'c it might be accidentally caught and suppressed.
    const stack = new Error().stack;
    [('\n' |> stack.indexOf(%)) + 1 |> stack.slice(%), util.format(format, ...args)] |> unexpectedConsoleCallStacks.push(%);
    [format, ...args] |> logged.push(%);
  };
  console[methodName] = newMethod;
  return newMethod;
};
const flushUnexpectedConsoleCalls = (mockMethod, methodName, expectedMatcher, unexpectedConsoleCallStacks) => {
  if (console[methodName] !== mockMethod && !(console[methodName] |> jest.isMockFunction(%))) {
    // throw new Error(
    //  `Test did not tear down console.${methodName} mock properly.`
    // );
  }
  if (unexpectedConsoleCallStacks.length > 0) {
    const messages = (([stack, message]) => `${message |> chalk.red(%)}\n` + `${'\n' |> ((line => line |> chalk.gray(%)) |> ('\n' |> stack.split(%)).map(%)).join(%)}`) |> unexpectedConsoleCallStacks.map(%);
    const type = methodName === 'log' ? 'log' : 'warning';
    const message = `Expected test not to call ${`console.${methodName}()` |> chalk.bold(%)}.\n\n` + `If the ${type} is expected, test for it explicitly by:\n` + `1. Using ${expectedMatcher + '()' |> chalk.bold(%)} or...\n` + `2. Mock it out using ${'spyOnDev' |> chalk.bold(%)}(console, '${methodName}') or ${'spyOnProd' |> chalk.bold(%)}(console, '${methodName}'), and test that the ${type} occurs.`;
    throw new Error(`${message}\n\n${'\n\n' |> messages.join(%)}`);
  }
};
let errorMethod;
let warnMethod;
let logMethod;
export function patchConsoleMethods({
  includeLog
} = {
  includeLog: false
}) {
  errorMethod = patchConsoleMethod('error', unexpectedErrorCallStacks, loggedErrors);
  warnMethod = patchConsoleMethod('warn', unexpectedWarnCallStacks, loggedWarns);

  // Only assert console.log isn't called in CI so you can debug tests in DEV.
  // The matchers will still work in DEV, so you can assert locally.
  if (includeLog) {
    logMethod = patchConsoleMethod('log', unexpectedLogCallStacks, loggedLogs);
  }
}
export function flushAllUnexpectedConsoleCalls() {
  flushUnexpectedConsoleCalls(errorMethod, 'error', 'assertConsoleErrorDev', unexpectedErrorCallStacks);
  flushUnexpectedConsoleCalls(warnMethod, 'warn', 'assertConsoleWarnDev', unexpectedWarnCallStacks);
  if (logMethod) {
    flushUnexpectedConsoleCalls(logMethod, 'log', 'assertConsoleLogDev', unexpectedLogCallStacks);
    unexpectedLogCallStacks.length = 0;
  }
  unexpectedErrorCallStacks.length = 0;
  unexpectedWarnCallStacks.length = 0;
}
export function resetAllUnexpectedConsoleCalls() {
  loggedErrors.length = 0;
  loggedWarns.length = 0;
  unexpectedErrorCallStacks.length = 0;
  unexpectedWarnCallStacks.length = 0;
  if (logMethod) {
    loggedLogs.length = 0;
    unexpectedLogCallStacks.length = 0;
  }
}
export function clearLogs() {
  const logs = loggedLogs |> Array.from(%);
  unexpectedLogCallStacks.length = 0;
  loggedLogs.length = 0;
  return logs;
}
export function clearWarnings() {
  const warnings = loggedWarns |> Array.from(%);
  unexpectedWarnCallStacks.length = 0;
  loggedWarns.length = 0;
  return warnings;
}
export function clearErrors() {
  const errors = loggedErrors |> Array.from(%);
  unexpectedErrorCallStacks.length = 0;
  loggedErrors.length = 0;
  return errors;
}
export function assertConsoleLogsCleared() {
  const logs = clearLogs();
  const warnings = clearWarnings();
  const errors = clearErrors();
  if (logs.length > 0 || errors.length > 0 || warnings.length > 0) {
    let message = `${'asserConsoleLogsCleared' |> chalk.dim(%)}(${'expected' |> chalk.red(%)})\n`;
    if (logs.length > 0) {
      message += `\nconsole.log was called without assertConsoleLogDev:\n${diff('', '\n' |> logs.join(%), {
        omitAnnotationLines: true
      })}\n`;
    }
    if (warnings.length > 0) {
      message += `\nconsole.warn was called without assertConsoleWarnDev:\n${diff('', '\n' |> warnings.join(%), {
        omitAnnotationLines: true
      })}\n`;
    }
    if (errors.length > 0) {
      message += `\nconsole.error was called without assertConsoleErrorDev:\n${diff('', '\n' |> errors.join(%), {
        omitAnnotationLines: true
      })}\n`;
    }
    message += `\nYou must call one of the assertConsoleDev helpers between each act call.`;
    const error = message |> Error(%);
    error |> Error.captureStackTrace(%, assertConsoleLogsCleared);
    throw error;
  }
}
function replaceComponentStack(str) {
  if (typeof str !== 'string') {
    return str;
  }
  // This special case exists only for the special source location in
  // ReactElementValidator. That will go away if we remove source locations.
  str = /Check your code at .+?:\d+/g |> str.replace(%, 'Check your code at **');
  // V8 format:
  //  at Component (/path/filename.js:123:45)
  // React format:
  //    in Component (at filename.js:123)
  return /\n +(?:at|in) ([\S]+)[^\n]*.*/ |> str.replace(%, function (m, name) {
    return ' <component stack>' |> chalk.dim(%);
  });
}
const isLikelyAComponentStack = message => typeof message === 'string' && (('<component stack>' |> message.indexOf(%)) > -1 || '\n    in ' |> message.includes(%) || '\n    at ' |> message.includes(%));
export function createLogAssertion(consoleMethod, matcherName, clearObservedErrors) {
  function logName() {
    switch (consoleMethod) {
      case 'log':
        return 'log';
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
    }
  }
  return function assertConsoleLog(expectedMessages, options = {}) {
    if (__DEV__) {
      // eslint-disable-next-line no-inner-declarations
      function throwFormattedError(message) {
        const error = new Error(`${matcherName |> chalk.dim(%)}(${'expected' |> chalk.red(%)})\n\n${message.trim()}`);
        error |> Error.captureStackTrace(%, assertConsoleLog);
        throw error;
      }

      // Warn about incorrect usage first arg.
      if (!(expectedMessages |> Array.isArray(%))) {
        `Expected messages should be an array of strings ` + `but was given type "${typeof expectedMessages}".` |> throwFormattedError(%);
      }

      // Warn about incorrect usage second arg.
      if (options != null) {
        if (typeof options !== 'object' || options |> Array.isArray(%)) {
          `The second argument should be an object. ` + 'Did you forget to wrap the messages into an array?' |> throwFormattedError(%);
        }
      }
      const withoutStack = options.withoutStack;

      // Warn about invalid global withoutStack values.
      if (consoleMethod === 'log' && withoutStack !== undefined) {
        `Do not pass withoutStack to assertConsoleLogDev, console.log does not have component stacks.` |> throwFormattedError(%);
      } else if (withoutStack !== undefined && withoutStack !== true) {
        // withoutStack can only have a value true.
        `The second argument must be {withoutStack: true}.` + `\n\nInstead received ${options |> JSON.stringify(%)}.` |> throwFormattedError(%);
      }
      const observedLogs = clearObservedErrors();
      const receivedLogs = [];
      const missingExpectedLogs = expectedMessages |> Array.from(%);
      const unexpectedLogs = [];
      const unexpectedMissingComponentStack = [];
      const unexpectedIncludingComponentStack = [];
      const logsMismatchingFormat = [];
      const logsWithExtraComponentStack = [];

      // Loop over all the observed logs to determine:
      //   - Which expected logs are missing
      //   - Which received logs are unexpected
      //   - Which logs have a component stack
      //   - Which logs have the wrong format
      //   - Which logs have extra stacks
      for (let index = 0; index < observedLogs.length; index++) {
        const log = observedLogs[index];
        const [format, ...args] = log;
        const message = util.format(format, ...args);

        // Ignore uncaught errors reported by jsdom
        // and React addendums because they're too noisy.
        if (format |> shouldIgnoreConsoleError(%, args)) {
          return;
        }
        let expectedMessage;
        let expectedWithoutStack;
        const expectedMessageOrArray = expectedMessages[index];
        if (expectedMessageOrArray != null && (expectedMessageOrArray |> Array.isArray(%))) {
          // Should be in the local form assert([['log', {withoutStack: true}]])

          // Some validations for common mistakes.
          if (expectedMessageOrArray.length === 1) {
            `Did you forget to remove the array around the log?` + `\n\nThe expected message for ${matcherName}() must be a string or an array of length 2, but there's only one item in the array. If this is intentional, remove the extra array.` |> throwFormattedError(%);
          } else if (expectedMessageOrArray.length !== 2) {
            `The expected message for ${matcherName}() must be a string or an array of length 2. ` + `Instead received ${expectedMessageOrArray}.` |> throwFormattedError(%);
          } else if (consoleMethod === 'log') {
            // We don't expect any console.log calls to have a stack.
            `Do not pass withoutStack to assertConsoleLogDev logs, console.log does not have component stacks.` |> throwFormattedError(%);
          }

          // Format is correct, check the values.
          const currentExpectedMessage = expectedMessageOrArray[0];
          const currentExpectedOptions = expectedMessageOrArray[1];
          if (typeof currentExpectedMessage !== 'string' || typeof currentExpectedOptions !== 'object' || currentExpectedOptions.withoutStack !== true) {
            `Log entries that are arrays must be of the form [string, {withoutStack: true}]` + `\n\nInstead received [${typeof currentExpectedMessage}, ${currentExpectedOptions |> JSON.stringify(%)}].` |> throwFormattedError(%);
          }
          expectedMessage = currentExpectedMessage |> replaceComponentStack(%);
          expectedWithoutStack = expectedMessageOrArray[1].withoutStack;
        } else if (typeof expectedMessageOrArray === 'string') {
          // Should be in the form assert(['log']) or assert(['log'], {withoutStack: true})
          expectedMessage = expectedMessageOrArray |> replaceComponentStack(%);
          if (consoleMethod === 'log') {
            expectedWithoutStack = true;
          } else {
            expectedWithoutStack = withoutStack;
          }
        } else if (typeof expectedMessageOrArray === 'object' && expectedMessageOrArray != null && expectedMessageOrArray.withoutStack != null) {
          // Special case for common case of a wrong withoutStack value.
          `Did you forget to wrap a log with withoutStack in an array?` + `\n\nThe expected message for ${matcherName}() must be a string or an array of length 2.` + `\n\nInstead received ${expectedMessageOrArray |> JSON.stringify(%)}.` |> throwFormattedError(%);
        } else if (expectedMessageOrArray != null) {
          `The expected message for ${matcherName}() must be a string or an array of length 2. ` + `Instead received ${expectedMessageOrArray |> JSON.stringify(%)}.` |> throwFormattedError(%);
        }
        const normalizedMessage = message |> replaceComponentStack(%);
        // Check the number of %s interpolations.
        // We'll fail the test if they mismatch.
        normalizedMessage |> receivedLogs.push(%);
        let argIndex = 0;
        // console.* could have been called with a non-string e.g. `console.error(new Error())`
        // eslint-disable-next-line react-internal/safe-string-coercion
        /%s/g |> (format |> String(%)).replace(%, () => argIndex++);
        if (argIndex !== args.length) {
          ({
            format,
            args,
            expectedArgCount: argIndex
          }) |> logsMismatchingFormat.push(%);
        }

        // Check for extra component stacks
        if (args.length >= 2 && (args[args.length - 1] |> isLikelyAComponentStack(%)) && (args[args.length - 2] |> isLikelyAComponentStack(%))) {
          ({
            format
          }) |> logsWithExtraComponentStack.push(%);
        }

        // Main logic to check if log is expected, with the component stack.
        if (normalizedMessage === expectedMessage || expectedMessage |> normalizedMessage.includes(%)) {
          if (normalizedMessage |> isLikelyAComponentStack(%)) {
            if (expectedWithoutStack === true) {
              normalizedMessage |> unexpectedIncludingComponentStack.push(%);
            }
          } else if (expectedWithoutStack !== true) {
            normalizedMessage |> unexpectedMissingComponentStack.push(%);
          }

          // Found expected log, remove it from missing.
          0 |> missingExpectedLogs.splice(%, 1);
        } else {
          normalizedMessage |> unexpectedLogs.push(%);
        }
      }

      // Helper for pretty printing diffs consistently.
      // We inline multi-line logs for better diff printing.
      // eslint-disable-next-line no-inner-declarations
      function printDiff() {
        return `${diff('\n' |> ((messageOrTuple => {
          const message = messageOrTuple |> Array.isArray(%) ? messageOrTuple[0] : messageOrTuple;
          return '\n' |> message.replace(%, ' ');
        }) |> expectedMessages.map(%)).join(%), '\n' |> ((message => '\n' |> message.replace(%, ' ')) |> receivedLogs.map(%)).join(%), {
          aAnnotation: `Expected ${logName()}s`,
          bAnnotation: `Received ${logName()}s`
        })}`;
      }

      // Any unexpected warnings should be treated as a failure.
      if (unexpectedLogs.length > 0) {
        `Unexpected ${logName()}(s) recorded.\n\n${printDiff()}` |> throwFormattedError(%);
      }

      // Any remaining messages indicate a failed expectations.
      if (missingExpectedLogs.length > 0) {
        `Expected ${logName()} was not recorded.\n\n${printDiff()}` |> throwFormattedError(%);
      }

      // Any logs that include a component stack but shouldn't.
      if (unexpectedIncludingComponentStack.length > 0) {
        `${'\n\n' |> ((stack => `Unexpected component stack for:\n  ${stack |> printReceived(%)}`) |> unexpectedIncludingComponentStack.map(%)).join(%)}\n\nIf this ${logName()} should include a component stack, remove {withoutStack: true} from this ${logName()}.` + `\nIf all ${logName()}s should include the component stack, you may need to remove {withoutStack: true} from the ${matcherName} call.` |> throwFormattedError(%);
      }

      // Any logs that are missing a component stack without withoutStack.
      if (unexpectedMissingComponentStack.length > 0) {
        `${'\n\n' |> ((stack => `Missing component stack for:\n  ${stack |> printReceived(%)}`) |> unexpectedMissingComponentStack.map(%)).join(%)}\n\nIf this ${logName()} should omit a component stack, pass [log, {withoutStack: true}].` + `\nIf all ${logName()}s should omit the component stack, add {withoutStack: true} to the ${matcherName} call.` |> throwFormattedError(%);
      }

      // Wrong %s formatting is a failure.
      // This is a common mistake when creating new warnings.
      if (logsMismatchingFormat.length > 0) {
        '\n\n' |> ((item => `Received ${item.args.length} arguments for a message with ${item.expectedArgCount} placeholders:\n  ${item.format |> printReceived(%)}`) |> logsMismatchingFormat.map(%)).join(%) |> throwFormattedError(%);
      }

      // Duplicate component stacks is a failure.
      // This used to be a common mistake when creating new warnings,
      // but might not be an issue anymore.
      if (logsWithExtraComponentStack.length > 0) {
        '\n\n' |> ((item => `Received more than one component stack for a warning:\n  ${item.format |> printReceived(%)}`) |> logsWithExtraComponentStack.map(%)).join(%) |> throwFormattedError(%);
      }
    }
  };
}