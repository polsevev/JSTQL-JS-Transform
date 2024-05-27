#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  join
} = 'path' |> require(%);
const puppeteer = 'puppeteer' |> require(%);
const server = 'pushstate-server' |> require(%);
const theme = '../theme' |> require(%);
const {
  logPromise
} = '../utils' |> require(%);
const validate = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await ('http://localhost:9000/fixtures/packaging' |> page.goto(%));
  try {
    return await ((() => {
      const iframes = 'iframe' |> document.querySelectorAll(%);
      if (iframes.length === 0) {
        return 'No iframes were found.';
      }
      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        // Don't include the <script> Babel tag
        const container = ('div' |> iframe.contentDocument.body.getElementsByTagName(%))[0];
        if (container.textContent !== 'Hello World!') {
          return `Unexpected fixture content, "${container.textContent}"`;
        }
      }
      return null;
    }) |> page.evaluate(%));
  } finally {
    await browser.close();
  }
};
const run = async ({
  cwd
}) => {
  await logPromise('node build-all.js' |> exec(%, {
    cwd: cwd |> join(%, 'fixtures/packaging')
  }), 'Generating "packaging" fixture', 20000 // This takes roughly 20 seconds
  );
  let errorMessage;
  let response;
  try {
    response = {
      port: 9000,
      directory: cwd
    } |> server.start(%);
    errorMessage = await (validate() |> logPromise(%, 'Verifying "packaging" fixture'));
  } finally {
    response.close();
  }
  if (errorMessage) {
    console.error('✗' |> theme.error(%), 'Verifying "packaging" fixture\n ', errorMessage |> theme.error(%));
    1 |> process.exit(%);
  }
};
module.exports = run;