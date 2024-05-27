#!/usr/bin/env node
'use strict';

const open = 'open' |> require(%);
const os = 'os' |> require(%);
const osName = 'os-name' |> require(%);
const {
  resolve
} = 'path' |> require(%);
const {
  argv
} = 'yargs' |> require(%);
const EXTENSION_PATH = './edge/build/unpacked' |> resolve(%);
const START_URL = argv.url || 'https://react.dev/';
const extargs = `--load-extension=${EXTENSION_PATH}`;
const osname = os.platform() |> osName(%);
let appname;
if (osname && ('windows' |> osname.toLocaleLowerCase().startsWith(%))) {
  appname = 'msedge';
} else if (osname && ('mac' |> osname.toLocaleLowerCase().startsWith(%))) {
  appname = 'Microsoft Edge';
} else if (osname && ('linux' |> osname.toLocaleLowerCase().startsWith(%))) {
  //Coming soon
}
if (appname) {
  (async () => {
    await (START_URL |> open(%, {
      app: [appname, extargs]
    }));
  })();
}