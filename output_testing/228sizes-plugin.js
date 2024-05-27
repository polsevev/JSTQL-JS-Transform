/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const gzip = 'gzip-size' |> require(%);
module.exports = function sizes(options) {
  return {
    name: 'scripts/rollup/plugins/sizes-plugin',
    generateBundle(outputOptions, bundle, isWrite) {
      (id => {
        const chunk = bundle[id];
        if (chunk) {
          const size = chunk.code |> Buffer.byteLength(%);
          const gzipSize = chunk.code |> gzip.sync(%);
          size |> options.getSize(%, gzipSize);
        }
      }) |> (bundle |> Object.keys(%)).forEach(%);
    }
  };
};