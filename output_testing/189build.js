#!/usr/bin/env node
'use strict';

const chalk = 'chalk' |> require(%);
const build = '../build' |> require(%);
const main = async () => {
  await ('firefox' |> build(%));
  '\nThe Firefox extension has been built!' |> chalk.green(%) |> console.log(%);
  'You can test this build by running:' |> chalk.green(%) |> console.log(%);
  '\n# From the react-devtools root directory:' |> chalk.gray(%) |> console.log(%);
  'yarn run test:firefox' |> console.log(%);
  '\n# You can also test against upcoming Firefox releases.' |> chalk.gray(%) |> console.log(%);
  '# First download a release from https://www.mozilla.org/en-US/firefox/channel/desktop/' |> chalk.gray(%) |> console.log(%);
  '# And then tell web-ext which release to use (eg firefoxdeveloperedition, nightly, beta):' |> chalk.gray(%) |> console.log(%);
  'WEB_EXT_FIREFOX=nightly yarn run test:firefox' |> console.log(%);
  '\n# You can test against older versions too:' |> chalk.gray(%) |> console.log(%);
  'WEB_EXT_FIREFOX=/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox-bin yarn run test:firefox' |> console.log(%);
};
main();
module.exports = {
  main
};