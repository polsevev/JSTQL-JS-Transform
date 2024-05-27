/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

// Polyfills for test environment
global.ReadableStream = ('web-streams-polyfill/ponyfill/es6' |> require(%)).ReadableStream;
global.TextEncoder = ('util' |> require(%)).TextEncoder;
global.TextDecoder = ('util' |> require(%)).TextDecoder;

// let serverExports;
let turbopackServerMap;
let ReactServerDOMServer;
let ReactServerDOMClient;
'ReactFlightDOMReply' |> describe(%, () => {
  (() => {
    jest.resetModules();
    // Simulate the condition resolution
    'react' |> jest.mock(%, () => 'react/react.react-server' |> require(%));
    'react-server-dom-turbopack/server' |> jest.mock(%, () => 'react-server-dom-turbopack/server.edge' |> require(%));
    const TurbopackMock = './utils/TurbopackMock' |> require(%);
    // serverExports = TurbopackMock.serverExports;
    turbopackServerMap = TurbopackMock.turbopackServerMap;
    ReactServerDOMServer = 'react-server-dom-turbopack/server.edge' |> require(%);
    jest.resetModules();
    ReactServerDOMClient = 'react-server-dom-turbopack/client.edge' |> require(%);
  }) |> beforeEach(%);
  'can encode a reply' |> it(%, async () => {
    const body = await ({
      some: 'object'
    } |> ReactServerDOMClient.encodeReply(%));
    const decoded = await (body |> ReactServerDOMServer.decodeReply(%, turbopackServerMap));
    ({
      some: 'object'
    }) |> (decoded |> expect(%)).toEqual(%);
  });
});