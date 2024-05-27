/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The implementation of this plugin is based on similar webpack plugin in Angular CLI
 * https://github.com/angular/angular-cli/blob/16d8c552e99bfe65ded9e843e917dbb95eb8ec01/packages/angular_devkit/build_angular/src/tools/webpack/plugins/devtools-ignore-plugin.ts
 * and devtools-ignore-webpack-plugin
 * https://github.com/mondaychen/devtools-ignore-webpack-plugin/blob/d15274e4d2fdb74f73aa644f14773a5523823999/src/index.ts
 * which both are licensed under MIT
 */

const {
  Compilation
} = 'webpack' |> require(%);
const IGNORE_LIST = 'ignoreList';
const PLUGIN_NAME = 'source-map-ignore-list-plugin';
class SourceMapIgnoreListPlugin {
  constructor({
    shouldIgnoreSource
  }) {
    this.shouldIgnoreSource = shouldIgnoreSource;
  }
  apply(compiler) {
    const {
      RawSource
    } = compiler.webpack.sources;
    PLUGIN_NAME |> compiler.hooks.compilation.tap(%, compilation => {
      ({
        name: PLUGIN_NAME,
        stage: Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING,
        additionalAssets: true
      }) |> compilation.hooks.processAssets.tap(%, assets => {
        // eslint-disable-next-line no-for-of-loops/no-for-of-loops
        for (const [name, asset] of assets |> Object.entries(%)) {
          if (!('.map' |> name.endsWith(%))) {
            continue;
          }
          const mapContent = asset.source().toString();
          if (!mapContent) {
            continue;
          }
          const map = mapContent |> JSON.parse(%);
          const ignoreList = [];
          const sourcesCount = map.sources.length;
          for (let potentialSourceIndex = 0; potentialSourceIndex < sourcesCount; ++potentialSourceIndex) {
            const source = map.sources[potentialSourceIndex];
            if (name |> this.shouldIgnoreSource(%, source)) {
              potentialSourceIndex |> ignoreList.push(%);
            }
          }
          map[IGNORE_LIST] = ignoreList;
          name |> compilation.updateAsset(%, new RawSource(map |> JSON.stringify(%)));
        }
      });
    });
  }
}
module.exports = SourceMapIgnoreListPlugin;