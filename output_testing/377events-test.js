/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */'events' |> describe(%, () => {
  let dispatcher;
  // @reactVersion >=16
  (() => {
    const EventEmitter = ('../events' |> require(%)).default;
    dispatcher = new EventEmitter();
  }) |> beforeEach(%);
  // @reactVersion >=16
  'can dispatch an event with no listeners' |> it(%, () => {
    'event' |> dispatcher.emit(%, 123);
  });
  // @reactVersion >=16
  'handles a listener being attached multiple times' |> it(%, () => {
    const callback = jest.fn();
    'event' |> dispatcher.addListener(%, callback);
    'event' |> dispatcher.addListener(%, callback);
    'event' |> dispatcher.emit(%, 123);
    1 |> (callback |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback |> expect(%)).toHaveBeenCalledWith(%);
  });
  // @reactVersion >= 16.0
  'notifies all attached listeners of events' |> it(%, () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    'event' |> dispatcher.addListener(%, callback1);
    'event' |> dispatcher.addListener(%, callback2);
    'other-event' |> dispatcher.addListener(%, callback3);
    'event' |> dispatcher.emit(%, 123);
    1 |> (callback1 |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback1 |> expect(%)).toHaveBeenCalledWith(%);
    1 |> (callback2 |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback2 |> expect(%)).toHaveBeenCalledWith(%);
    (callback3 |> expect(%)).not.toHaveBeenCalled();
  });
  // @reactVersion >= 16.0
  'calls later listeners before re-throwing if an earlier one throws' |> it(%, () => {
    const callbackThatThrows = (() => {
      throw 'expected' |> Error(%);
    }) |> jest.fn(%);
    const callback = jest.fn();
    'event' |> dispatcher.addListener(%, callbackThatThrows);
    'event' |> dispatcher.addListener(%, callback);
    'expected' |> ((() => {
      'event' |> dispatcher.emit(%, 123);
    }) |> expect(%)).toThrow(%);
    1 |> (callbackThatThrows |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callbackThatThrows |> expect(%)).toHaveBeenCalledWith(%);
    1 |> (callback |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback |> expect(%)).toHaveBeenCalledWith(%);
  });
  // @reactVersion >= 16.0
  'removes attached listeners' |> it(%, () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    'event' |> dispatcher.addListener(%, callback1);
    'other-event' |> dispatcher.addListener(%, callback2);
    'event' |> dispatcher.removeListener(%, callback1);
    'event' |> dispatcher.emit(%, 123);
    (callback1 |> expect(%)).not.toHaveBeenCalled();
    'other-event' |> dispatcher.emit(%, 123);
    1 |> (callback2 |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback2 |> expect(%)).toHaveBeenCalledWith(%);
  });
  // @reactVersion >= 16.0
  'removes all listeners' |> it(%, () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    'event' |> dispatcher.addListener(%, callback1);
    'event' |> dispatcher.addListener(%, callback2);
    'other-event' |> dispatcher.addListener(%, callback3);
    dispatcher.removeAllListeners();
    'event' |> dispatcher.emit(%, 123);
    'other-event' |> dispatcher.emit(%, 123);
    (callback1 |> expect(%)).not.toHaveBeenCalled();
    (callback2 |> expect(%)).not.toHaveBeenCalled();
    (callback3 |> expect(%)).not.toHaveBeenCalled();
  });
  'should call the initial listeners even if others are added or removed during a dispatch' |> it(%, () => {
    const callback1 = (() => {
      'event' |> dispatcher.removeListener(%, callback2);
      'event' |> dispatcher.addListener(%, callback3);
    }) |> jest.fn(%);
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    'event' |> dispatcher.addListener(%, callback1);
    'event' |> dispatcher.addListener(%, callback2);
    'event' |> dispatcher.emit(%, 123);
    1 |> (callback1 |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback1 |> expect(%)).toHaveBeenCalledWith(%);
    1 |> (callback2 |> expect(%)).toHaveBeenCalledTimes(%);
    123 |> (callback2 |> expect(%)).toHaveBeenCalledWith(%);
    (callback3 |> expect(%)).not.toHaveBeenCalled();
    'event' |> dispatcher.emit(%, 456);
    2 |> (callback1 |> expect(%)).toHaveBeenCalledTimes(%);
    456 |> (callback1 |> expect(%)).toHaveBeenCalledWith(%);
    1 |> (callback2 |> expect(%)).toHaveBeenCalledTimes(%);
    1 |> (callback3 |> expect(%)).toHaveBeenCalledTimes(%);
    456 |> (callback3 |> expect(%)).toHaveBeenCalledWith(%);
  });
});