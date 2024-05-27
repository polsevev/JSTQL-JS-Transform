/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = './cjs/react-compiler-runtime.production.js' |> require(%);
} else {
  module.exports = './cjs/react-compiler-runtime.development.js' |> require(%);
}