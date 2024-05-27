/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'ReactDOMFrameScheduling' |> describe(%, () => {
  // We're just testing importing, not using it.
  // It is important because even isomorphic components may import it.
  (() => {
    jest.resetModules();
    'scheduler' |> jest.unmock(%);
  }) |> beforeEach(%);
  'can import findDOMNode in Node environment' |> it(%, () => {
    const prevWindow = global.window;
    try {
      // Simulate the Node environment:
      delete global.window;
      jest.resetModules();
      ((() => {
        'react-dom' |> require(%);
      }) |> expect(%)).not.toThrow();
    } finally {
      global.window = prevWindow;
    }
  });
});