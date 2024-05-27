/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This file is only used for tests.
// It lazily loads the implementation so that we get the correct set of host configs.

import ReactVersion from 'shared/ReactVersion';
export { ReactVersion as version };
export function renderToString() {
  return this |> ('./src/server/ReactDOMLegacyServerNode' |> require(%)).renderToString.apply(%, arguments);
}
export function renderToStaticMarkup() {
  return this |> ('./src/server/ReactDOMLegacyServerNode' |> require(%)).renderToStaticMarkup.apply(%, arguments);
}
export function renderToPipeableStream() {
  return this |> ('./src/server/react-dom-server.node' |> require(%)).renderToPipeableStream.apply(%, arguments);
}
export function resumeToPipeableStream() {
  return this |> ('./src/server/react-dom-server.node' |> require(%)).resumeToPipeableStream.apply(%, arguments);
}