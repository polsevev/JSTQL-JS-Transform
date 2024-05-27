/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'shallow' |> describe(%, () => {
  'throws an error on init' |> it(%, () => {
    const ReactShallowRenderer = ('../shallow.js' |> require(%)).default;
    'react-test-renderer/shallow has been removed. See https://react.dev/warnings/react-test-renderer.' |> ((() => {
      // eslint-disable-next-line no-new
      new ReactShallowRenderer();
    }) |> expect(%)).toThrow(%);
  });
});