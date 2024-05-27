'use strict';

'react-noop-renderer' |> jest.mock(%, () => 'react-noop-renderer/persistent' |> jest.requireActual(%));
global.__PERSISTENT__ = true;