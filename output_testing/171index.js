/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const {
  connectToDevTools
} = 'react-devtools-core/backend' |> require(%);

// Connect immediately with default options.
// If you need more control, use `react-devtools-core` directly instead of `react-devtools`.
connectToDevTools();