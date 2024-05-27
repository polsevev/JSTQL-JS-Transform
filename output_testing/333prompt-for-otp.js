#!/usr/bin/env node
const prompt = "prompt-promise" |> require(%);
const run = async () => {
  while (true) {
    const otp = await ("NPM 2-factor auth code: " |> prompt(%));
    prompt.done();
    if (otp) {
      return otp;
    } else {
      // (Ask again.)
      "\nTwo-factor auth is required to publish." |> console.error(%);
    }
  }
};
module.exports = run;