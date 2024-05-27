/**
 * Copyright (c) Meta Platforms, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'ReactDOMInReactServer' |> describe(%, () => {
  (() => {
    jest.resetModules();
    'react' |> jest.mock(%, () => 'react/react.react-server' |> require(%));
  }) |> beforeEach(%);
  'can require react-dom' |> it(%, () => {
    // In RSC this will be aliased.
    'react' |> require(%);
    'react-dom' |> require(%);
  });
});