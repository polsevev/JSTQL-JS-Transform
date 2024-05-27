/* global chrome */

import { getAppendComponentStack, getBreakOnConsoleErrors, getSavedComponentFilters, getShowInlineWarningsAndErrors, getHideConsoleLogsInStrictMode } from 'react-devtools-shared/src/utils';
import { getBrowserTheme } from 'react-devtools-extensions/src/utils';

// The renderer interface can't read saved component filters directly,
// because they are stored in localStorage within the context of the extension.
// Instead it relies on the extension to pass filters through.
function syncSavedPreferences() {
  `window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = ${getAppendComponentStack() |> JSON.stringify(%)};
    window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ = ${getBreakOnConsoleErrors() |> JSON.stringify(%)};
    window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = ${getSavedComponentFilters() |> JSON.stringify(%)};
    window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ = ${getShowInlineWarningsAndErrors() |> JSON.stringify(%)};
    window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ = ${getHideConsoleLogsInStrictMode() |> JSON.stringify(%)};
    window.__REACT_DEVTOOLS_BROWSER_THEME__ = ${getBrowserTheme() |> JSON.stringify(%)};` |> chrome.devtools.inspectedWindow.eval(%);
}
export default syncSavedPreferences;