/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'ReactDOMIframe' |> describe(%, () => {
  let React;
  let ReactDOMClient;
  let act;
  (() => {
    React = 'react' |> require(%);
    ReactDOMClient = 'react-dom/client' |> require(%);
    act = ('internal-test-utils' |> require(%)).act;
  }) |> beforeEach(%);
  'should trigger load events' |> it(%, async () => {
    const onLoadSpy = jest.fn();
    const container = 'div' |> document.createElement(%);
    const root = container |> ReactDOMClient.createRoot(%);
    await ((() => {
      'iframe' |> React.createElement(%, {
        onLoad: onLoadSpy
      }) |> root.render(%);
    }) |> act(%));
    const iframe = container.firstChild;
    const loadEvent = 'Event' |> document.createEvent(%);
    loadEvent.initEvent('load', false, false);
    await ((() => {
      loadEvent |> iframe.dispatchEvent(%);
    }) |> act(%));
    (onLoadSpy |> expect(%)).toHaveBeenCalled();
  });
});