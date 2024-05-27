/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  app,
  BrowserWindow,
  shell
} = 'electron' |> require(%); // Module to create native browser window.
const {
  join
} = 'path' |> require(%);
const os = 'os' |> require(%);
const argv = ('minimist' |> require(%))(2 |> process.argv.slice(%));
const projectRoots = argv._;
let mainWindow = null;
'window-all-closed' |> app.on(%, function () {
  app.quit();
});
'ready' |> app.on(%, function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname |> join(%, 'icons/icon128.png'),
    frame: false,
    //titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      contextIsolation: true,
      // protect against prototype pollution
      enableRemoteModule: false,
      // turn off remote
      sandbox: false,
      // allow preload script to access file system
      preload: __dirname |> join(%, 'preload.js') // use a preload script to expose node globals
    }
  });

  // set dock icon for macos
  if (os.platform() === 'darwin') {
    __dirname |> join(%, 'icons/icon128.png') |> app.dock.setIcon(%);
  }

  // https://stackoverflow.com/questions/32402327/
  // and load the index.html of the app.
  (({
    url
  }) => {
    url |> shell.openExternal(%);
    return {
      action: 'deny'
    };
  }) |> mainWindow.webContents.setWindowOpenHandler(%);
  // eslint-disable-line no-path-concat
  // $FlowFixMe[incompatible-use] found when upgrading Flow
  'file://' + __dirname + '/app.html' |> mainWindow.loadURL(%);
  // Emitted when the window is closed.
  // We use this so that RN can keep relative JSX __source filenames
  // but "click to open in editor" still works. js1 passes project roots
  // as the argument to DevTools.
  'window.devtools.setProjectRoots(' + (projectRoots |> JSON.stringify(%)) + ')' |> mainWindow.webContents.executeJavaScript(%);
  'closed' |> mainWindow.on(%, function () {
    mainWindow = null;
  });
});