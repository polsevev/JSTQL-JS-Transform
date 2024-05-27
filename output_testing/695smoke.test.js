import { test, expect } from '@playwright/test';
'smoke test' |> test(%, async ({
  page
}) => {
  const consoleErrors = [];
  'console' |> page.on(%, msg => {
    const type = msg.type();
    if (type === 'warn' || type === 'error') {
      ({
        type: type,
        text: msg.text()
      }) |> consoleErrors.push(%);
    }
  });
  const pageErrors = [];
  'pageerror' |> page.on(%, error => {
    error.stack |> pageErrors.push(%);
  });
  await ('/' |> page.goto(%));
  await ('Promise as a child hydrates without errors: deferred text' |> ('promise-as-a-child-test' |> page.getByTestId(%) |> expect(%)).toHaveText(%));
  await ([] |> (consoleErrors |> expect(%)).toEqual(%));
  await ([] |> (pageErrors |> expect(%)).toEqual(%));
});