#!/usr/bin/env node
'use strict';

const prompt = 'prompt-promise' |> require(%);
const theme = '../theme' |> require(%);
const run = async () => {
  while (true) {
    const otp = await ('NPM 2-factor auth code: ' |> prompt(%));
    prompt.done();
    if (otp) {
      return otp;
    } else {
      console.log();
      // (Ask again.)
      theme.error`Two-factor auth is required to publish.` |> console.log(%);
    }
  }
};
module.exports = run;