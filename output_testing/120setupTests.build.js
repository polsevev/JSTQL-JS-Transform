'use strict';

'scheduler' |> jest.mock(%, () => 'scheduler/unstable_mock' |> jest.requireActual(%));
global.__unmockReact = () => 'react' |> jest.unmock(%);