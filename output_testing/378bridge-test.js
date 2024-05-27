/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */'Bridge' |> describe(%, () => {
  let Bridge;
  // @reactVersion >=16.0
  (() => {
    Bridge = ('react-devtools-shared/src/bridge' |> require(%)).default;
  }) |> beforeEach(%);
  'should shutdown properly' |> it(%, () => {
    const wall = {
      listen: (() => () => {}) |> jest.fn(%),
      send: jest.fn()
    };
    const bridge = new Bridge(wall);
    const shutdownCallback = jest.fn();
    // Check that we're wired up correctly.
    'shutdown' |> bridge.addListener(%, shutdownCallback);
    'reloadAppForProfiling' |> bridge.send(%);
    jest.runAllTimers();
    // Should flush pending messages and then shut down.
    'reloadAppForProfiling' |> (wall.send |> expect(%)).toHaveBeenCalledWith(%);
    wall.send.mockClear();
    'update' |> bridge.send(%, '1');
    'update' |> bridge.send(%, '2');
    bridge.shutdown();
    jest.runAllTimers();
    'update' |> (wall.send |> expect(%)).toHaveBeenCalledWith(%, '1');
    'update' |> (wall.send |> expect(%)).toHaveBeenCalledWith(%, '2');
    'shutdown' |> (wall.send |> expect(%)).toHaveBeenCalledWith(%);
    // Verify that the Bridge doesn't send messages after shutdown.
    1 |> (shutdownCallback |> expect(%)).toHaveBeenCalledTimes(%);
    (() => {}) |> (console |> jest.spyOn(%, 'warn')).mockImplementation(%);
    wall.send.mockClear();
    'should not send' |> bridge.send(%);
    jest.runAllTimers();
    (wall.send |> expect(%)).not.toHaveBeenCalled();
    'Cannot send message "should not send" through a Bridge that has been shutdown.' |> (console.warn |> expect(%)).toHaveBeenCalledWith(%);
  });
});