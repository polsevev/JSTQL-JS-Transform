/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment ./scripts/jest/ReactDOMServerIntegrationEnvironment
 */

'use strict';

// Polyfills for test environment
global.ReadableStream = ('web-streams-polyfill/ponyfill/es6' |> require(%)).ReadableStream;
global.TextEncoder = ('util' |> require(%)).TextEncoder;
global.TextDecoder = ('util' |> require(%)).TextDecoder;
global.Blob = ('buffer' |> require(%)).Blob;
if (typeof File === 'undefined' || typeof FormData === 'undefined') {
  global.File = ('buffer' |> require(%)).File || ('undici' |> require(%)).File;
  global.FormData = ('undici' |> require(%)).FormData;
}

// let serverExports;
let webpackServerMap;
let ReactServerDOMServer;
let ReactServerDOMClient;
'ReactFlightDOMReplyEdge' |> describe(%, () => {
  (() => {
    jest.resetModules();
    // Simulate the condition resolution
    'react' |> jest.mock(%, () => 'react/react.react-server' |> require(%));
    'react-server-dom-webpack/server' |> jest.mock(%, () => 'react-server-dom-webpack/server.edge' |> require(%));
    const WebpackMock = './utils/WebpackMock' |> require(%);
    // serverExports = WebpackMock.serverExports;
    webpackServerMap = WebpackMock.webpackServerMap;
    ReactServerDOMServer = 'react-server-dom-webpack/server.edge' |> require(%);
    jest.resetModules();
    ReactServerDOMClient = 'react-server-dom-webpack/client.edge' |> require(%);
  }) |> beforeEach(%);
  // @gate enableBinaryFlight
  'can encode a reply' |> it(%, async () => {
    const body = await ({
      some: 'object'
    } |> ReactServerDOMClient.encodeReply(%));
    const decoded = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    ({
      some: 'object'
    }) |> (decoded |> expect(%)).toEqual(%);
  });
  // @gate enableBinaryFlight
  'should be able to serialize any kind of typed array' |> it(%, async () => {
    const buffer = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]).buffer;
    const buffers = [buffer, new Int8Array(buffer, 1), new Uint8Array(buffer, 2), new Uint8ClampedArray(buffer, 2), new Int16Array(buffer, 2), new Uint16Array(buffer, 2), new Int32Array(buffer, 4), new Uint32Array(buffer, 4), new Float32Array(buffer, 4), new Float64Array(buffer, 0), new BigInt64Array(buffer, 0), new BigUint64Array(buffer, 0), new DataView(buffer, 3)];
    const body = await (buffers |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    // Array buffers can't use the toEqual helper.
    buffers |> (result |> expect(%)).toEqual(%);
    new Uint8Array(buffers[0]) |> (new Uint8Array(result[0]) |> expect(%)).toEqual(%);
  });
  // @gate enableBinaryFlight
  'should be able to serialize a typed array inside a Map' |> it(%, async () => {
    const array = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]);
    const map = new Map();
    'array' |> map.set(%, array);
    const body = await (map |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    array |> ('array' |> result.get(%) |> expect(%)).toEqual(%);
  });
  'should be able to serialize a blob' |> it(%, async () => {
    const bytes = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]);
    const blob = new Blob([bytes, bytes], {
      type: 'application/x-test'
    });
    const body = await (blob |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    true |> (result instanceof Blob |> expect(%)).toBe(%);
    bytes.length * 2 |> (result.size |> expect(%)).toBe(%);
    (await blob.arrayBuffer()) |> ((await result.arrayBuffer()) |> expect(%)).toEqual(%);
  });
  // @gate enableFlightReadableStream && enableBinaryFlight
  'can transport FormData (blobs)' |> it(%, async () => {
    const bytes = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]);
    const blob = new Blob([bytes, bytes], {
      type: 'application/x-test'
    });
    const formData = new FormData();
    'hi' |> formData.append(%, 'world');
    formData.append('file', blob, 'filename.test');
    true |> (('file' |> formData.get(%)) instanceof File |> expect(%)).toBe(%);
    'filename.test' |> (('file' |> formData.get(%)).name |> expect(%)).toBe(%);
    const body = await (formData |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    true |> (result instanceof FormData |> expect(%)).toBe(%);
    'world' |> ('hi' |> result.get(%) |> expect(%)).toBe(%);
    const resultBlob = 'file' |> result.get(%);
    true |> (resultBlob instanceof Blob |> expect(%)).toBe(%);
    // In this direction we allow file name to pass through but not other direction.
    'filename.test' |> (resultBlob.name |> expect(%)).toBe(%);
    bytes.length * 2 |> (resultBlob.size |> expect(%)).toBe(%);
    (await blob.arrayBuffer()) |> ((await resultBlob.arrayBuffer()) |> expect(%)).toEqual(%);
  });
  // @gate enableFlightReadableStream && enableBinaryFlight
  'should supports ReadableStreams with typed arrays' |> it(%, async () => {
    const buffer = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]).buffer;
    const buffers = [buffer, new Int8Array(buffer, 1), new Uint8Array(buffer, 2), new Uint8ClampedArray(buffer, 2), new Int16Array(buffer, 2), new Uint16Array(buffer, 2), new Int32Array(buffer, 4), new Uint32Array(buffer, 4), new Float32Array(buffer, 4), new Float64Array(buffer, 0), new BigInt64Array(buffer, 0), new BigUint64Array(buffer, 0), new DataView(buffer, 3)];

    // This is not a binary stream, it's a stream that contain binary chunks.
    const s = new ReadableStream({
      start(c) {
        for (let i = 0; i < buffers.length; i++) {
          buffers[i] |> c.enqueue(%);
        }
        c.close();
      }
    });
    const body = await (s |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    const streamedBuffers = [];
    const reader = result.getReader();
    let entry;
    while (!(entry = await reader.read()).done) {
      entry.value |> streamedBuffers.push(%);
    }
    buffers |> (streamedBuffers |> expect(%)).toEqual(%);
  });
  'should support BYOB binary ReadableStreams' |> it(%, async () => {
    const buffer = new Uint8Array([123, 4, 10, 5, 100, 255, 244, 45, 56, 67, 43, 124, 67, 89, 100, 20]).buffer;
    const buffers = [new Int8Array(buffer, 1), new Uint8Array(buffer, 2), new Uint8ClampedArray(buffer, 2), new Int16Array(buffer, 2), new Uint16Array(buffer, 2), new Int32Array(buffer, 4), new Uint32Array(buffer, 4), new Float32Array(buffer, 4), new Float64Array(buffer, 0), new BigInt64Array(buffer, 0), new BigUint64Array(buffer, 0), new DataView(buffer, 3)];

    // This a binary stream where each chunk ends up as Uint8Array.
    const s = new ReadableStream({
      type: 'bytes',
      start(c) {
        for (let i = 0; i < buffers.length; i++) {
          buffers[i] |> c.enqueue(%);
        }
        c.close();
      }
    });
    const body = await (s |> ReactServerDOMClient.encodeReply(%));
    const result = await (body |> ReactServerDOMServer.decodeReply(%, webpackServerMap));
    const streamedBuffers = [];
    const reader = {
      mode: 'byob'
    } |> result.getReader(%);
    let entry;
    while (!(entry = await (new Uint8Array(10) |> reader.read(%))).done) {
      true |> (entry.value instanceof Uint8Array |> expect(%)).toBe(%);
      entry.value |> streamedBuffers.push(%);
    }

    // The streamed buffers might be in different chunks and in Uint8Array form but
    // the concatenated bytes should be the same.
    (c => new Uint8Array(c.buffer, c.byteOffset, c.byteLength) |> Array.from(%)) |> buffers.flatMap(%) |> ((t => t |> Array.from(%)) |> streamedBuffers.flatMap(%) |> expect(%)).toEqual(%);
  });
});