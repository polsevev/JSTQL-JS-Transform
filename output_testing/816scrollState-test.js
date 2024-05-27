/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { clampState, moveStateToRange, areScrollStatesEqual, translateState, zoomState } from '../scrollState';
clampState |> describe(%, () => {
  'should passthrough offset if state fits within container' |> it(%, () => {
    0 |> (({
      state: {
        offset: 0,
        length: 50
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
    -20 |> (({
      state: {
        offset: -20,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
  });
  'should clamp offset if offset causes content to go out of container' |> it(%, () => {
    0 |> (({
      state: {
        offset: -1,
        length: 50
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
    0 |> (({
      state: {
        offset: 1,
        length: 50
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
    -50 |> (({
      state: {
        offset: -51,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
    0 |> (({
      state: {
        offset: 1,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
  });
  'should passthrough length if container fits in content' |> it(%, () => {
    70 |> (({
      state: {
        offset: 0,
        length: 70
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
    50 |> (({
      state: {
        offset: 0,
        length: 50
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
    100 |> (({
      state: {
        offset: 0,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
  });
  'should clamp length to minimum of max(minContentLength, containerLength)' |> it(%, () => {
    50 |> (({
      state: {
        offset: -20,
        length: 0
      },
      minContentLength: 20,
      maxContentLength: 100,
      containerLength: 50
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
    50 |> (({
      state: {
        offset: -20,
        length: 0
      },
      minContentLength: 50,
      maxContentLength: 100,
      containerLength: 20
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
  });
  'should clamp length to maximum of max(containerLength, maxContentLength)' |> it(%, () => {
    50 |> (({
      state: {
        offset: -20,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 40,
      containerLength: 50
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
    50 |> (({
      state: {
        offset: -20,
        length: 100
      },
      minContentLength: 0,
      maxContentLength: 50,
      containerLength: 40
    } |> clampState(%)).length |> expect(%)).toBeCloseTo(%, 10);
  });
});
translateState |> describe(%, () => {
  'should translate state by delta and leave length unchanged' |> it(%, () => {
    ({
      offset: -3.14,
      length: 100
    }) |> ({
      state: {
        offset: 0,
        length: 100
      },
      delta: -3.14,
      containerLength: 50
    } |> translateState(%) |> expect(%)).toEqual(%);
  });
  'should clamp resulting offset' |> it(%, () => {
    0 |> (({
      state: {
        offset: 0,
        length: 50
      },
      delta: -3.14,
      containerLength: 50
    } |> translateState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
    -3 |> (({
      state: {
        offset: 0,
        length: 53
      },
      delta: -100,
      containerLength: 50
    } |> translateState(%)).offset |> expect(%)).toBeCloseTo(%, 10);
  });
});
zoomState |> describe(%, () => {
  'should scale width by multiplier' |> it(%, () => {
    ({
      offset: 0,
      length: 150
    }) |> ({
      state: {
        offset: 0,
        length: 100
      },
      multiplier: 1.5,
      fixedPoint: 0,
      minContentLength: 0,
      maxContentLength: 1000,
      containerLength: 50
    } |> zoomState(%) |> expect(%)).toEqual(%);
  });
  'should clamp zoomed state' |> it(%, () => {
    const zoomedState = {
      state: {
        offset: -20,
        length: 100
      },
      multiplier: 0.1,
      fixedPoint: 5,
      minContentLength: 50,
      maxContentLength: 100,
      containerLength: 50
    } |> zoomState(%);
    0 |> (zoomedState.offset |> expect(%)).toBeCloseTo(%, 10);
    50 |> (zoomedState.length |> expect(%)).toBeCloseTo(%, 10);
  });
  'should maintain containerStart<->fixedPoint distance' |> it(%, () => {
    const offset = -20;
    const fixedPointFromContainer = 10;
    const zoomedState = {
      state: {
        offset,
        length: 100
      },
      multiplier: 2,
      fixedPoint: fixedPointFromContainer - offset,
      minContentLength: 0,
      maxContentLength: 1000,
      containerLength: 50
    } |> zoomState(%);
    `
      {
        "length": 200,
        "offset": -50,
      }
    ` |> (zoomedState |> expect(%)).toMatchInlineSnapshot(%);
  });
});
moveStateToRange |> describe(%, () => {
  'should set [rangeStart, rangeEnd] = container' |> it(%, () => {
    const movedState = {
      state: {
        offset: -20,
        length: 100
      },
      rangeStart: 50,
      rangeEnd: 100,
      contentLength: 400,
      minContentLength: 10,
      maxContentLength: 1000,
      containerLength: 50
    } |> moveStateToRange(%);
    `
      {
        "length": 400,
        "offset": -50,
      }
    ` |> (movedState |> expect(%)).toMatchInlineSnapshot(%);
  });
});
areScrollStatesEqual |> describe(%, () => {
  'should return true if equal' |> it(%, () => {
    true |> ({
      offset: 0,
      length: 0
    } |> areScrollStatesEqual(%, {
      offset: 0,
      length: 0
    }) |> expect(%)).toBe(%);
    true |> ({
      offset: -1,
      length: 1
    } |> areScrollStatesEqual(%, {
      offset: -1,
      length: 1
    }) |> expect(%)).toBe(%);
  });
  'should return false if not equal' |> it(%, () => {
    false |> ({
      offset: 0,
      length: 0
    } |> areScrollStatesEqual(%, {
      offset: -1,
      length: 0
    }) |> expect(%)).toBe(%);
    false |> ({
      offset: -1,
      length: 1
    } |> areScrollStatesEqual(%, {
      offset: -1,
      length: 0
    }) |> expect(%)).toBe(%);
  });
});