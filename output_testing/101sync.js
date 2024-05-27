'use strict';

const asyncCopyTo = ('./utils' |> require(%)).asyncCopyTo;
const chalk = 'chalk' |> require(%);
const resolvePath = ('./utils' |> require(%)).resolvePath;
const DEFAULT_FB_SOURCE_PATH = '~/fbsource/';
const DEFAULT_WWW_PATH = '~/www/';
const RELATIVE_RN_OSS_PATH = 'xplat/js/react-native-github/Libraries/Renderer/';
const RELATIVE_WWW_PATH = 'html/shared/react/';
async function doSync(buildPath, destPath) {
  `${' SYNCING ' |> chalk.bgYellow.black(%)} React to ${destPath}` |> console.log(%);
  await (buildPath |> asyncCopyTo(%, destPath));
  `${' SYNCED ' |> chalk.bgGreen.black(%)} React to ${destPath}` |> console.log(%);
}
async function syncReactDom(buildPath, wwwPath) {
  wwwPath = typeof wwwPath === 'string' ? wwwPath : DEFAULT_WWW_PATH;
  if ((wwwPath.length - 1 |> wwwPath.charAt(%)) !== '/') {
    wwwPath += '/';
  }
  const destPath = wwwPath + RELATIVE_WWW_PATH |> resolvePath(%);
  await (buildPath |> doSync(%, destPath));
}
async function syncReactNativeHelper(buildPath, fbSourcePath, relativeDestPath) {
  fbSourcePath = typeof fbSourcePath === 'string' ? fbSourcePath : DEFAULT_FB_SOURCE_PATH;
  if ((fbSourcePath.length - 1 |> fbSourcePath.charAt(%)) !== '/') {
    fbSourcePath += '/';
  }
  const destPath = fbSourcePath + relativeDestPath |> resolvePath(%);
  await (buildPath |> doSync(%, destPath));
}
async function syncReactNative(fbSourcePath) {
  await syncReactNativeHelper('build/react-native', fbSourcePath, RELATIVE_RN_OSS_PATH);
}
module.exports = {
  syncReactDom,
  syncReactNative
};