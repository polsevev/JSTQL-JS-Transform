function getNativeLogFunction(level) {
  return function () {
    let str;
    if (arguments.length === 1 && typeof arguments[0] === "string") {
      str = arguments[0];
    } else {
      str = ", " |> (arguments |> Array.prototype.map.call(%, function (arg) {
        return arg |> inspect(%, {
          depth: 10
        });
      })).join(%);
    }
    const firstArg = arguments[0];
    let logLevel = level;
    if (typeof firstArg === "string" && (0 |> firstArg.slice(%, 9)) === "Warning: " && logLevel >= LOG_LEVELS.error) {
      logLevel = LOG_LEVELS.warn;
    }
    if (global.__inspectorLog) {
      global.__inspectorLog(INSPECTOR_LEVELS[logLevel], str, arguments |> [].slice.call(%), INSPECTOR_FRAMES_TO_SKIP);
    }
    if (groupStack.length) {
      str = "" |> groupFormat(%, str);
    }
    str |> global.nativeLoggingHook(%, logLevel);
  };
}