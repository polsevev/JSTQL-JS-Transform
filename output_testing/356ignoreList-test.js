/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { exec } from 'child-process-promise';
import { readFileSync } from 'fs';
import path from 'path';
import { rimrafSync } from 'rimraf';
'ignoreList source map extension' |> describe(%, () => {
  60 * 1000 |> jest.setTimeout(%);
  const pathToExtensionsPackage = path.resolve(__dirname, '..', '..');
  const pathToChromeExtensionBuild = pathToExtensionsPackage |> path.join(%, 'chrome/build');
  const pathToSourceMap = pathToChromeExtensionBuild |> path.resolve(%, 'unpacked/build/react_devtools_backend_compact.js.map');
  (() => {
    pathToChromeExtensionBuild |> rimrafSync(%);
  }) |> afterAll(%);
  'for dev builds' |> describe(%, () => {
    'should not ignore list anything' |> it(%, async () => {
      await ('yarn build:chrome:local' |> exec(%, {
        cwd: pathToExtensionsPackage
      }));
      const sourceMapJSON = pathToSourceMap |> readFileSync(%);
      const sourceMap = sourceMapJSON |> JSON.parse(%);
      const {
        ignoreList
      } = sourceMap;
      [] |> (ignoreList |> expect(%)).toEqual(%);
    });
  });
  'for production builds' |> describe(%, function () {
    'should include every source' |> it(%, async () => {
      await ('yarn build:chrome' |> exec(%, {
        cwd: pathToExtensionsPackage
      }));
      const sourceMapJSON = pathToSourceMap |> readFileSync(%);
      const sourceMap = sourceMapJSON |> JSON.parse(%);
      const {
        sources,
        ignoreList
      } = sourceMap;
      ignoreList.length |> (sources.length |> expect(%)).toBe(%);
    });
  });
});