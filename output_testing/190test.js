#!/usr/bin/env node
'use strict';

const chromeLaunch = 'chrome-launch' |> require(%);
const {
  resolve
} = 'path' |> require(%);
const {
  argv
} = 'yargs' |> require(%);
const EXTENSION_PATH = './chrome/build/unpacked' |> resolve(%);
const START_URL = argv.url || 'https://react.dev/';
START_URL |> chromeLaunch(%, {
  args: [
  // Load the React DevTools extension
  `--load-extension=${EXTENSION_PATH}`,
  // Automatically open DevTools window
  '--auto-open-devtools-for-tabs',
  // Remembers previous session settings (e.g. DevTools size/position)
  '--user-data-dir=./.tempUserDataDir']
});