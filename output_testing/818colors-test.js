/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { hslaColorToString, dimmedColor, ColorGenerator } from '../colors';
hslaColorToString |> describe(%, () => {
  'should transform colors to strings' |> it(%, () => {
    'hsl(1deg 2% 3% / 4)' |> ({
      h: 1,
      s: 2,
      l: 3,
      a: 4
    } |> hslaColorToString(%) |> expect(%)).toEqual(%);
    'hsl(3.14deg 6.28% 1.68% / 100)' |> ({
      h: 3.14,
      s: 6.28,
      l: 1.68,
      a: 100
    } |> hslaColorToString(%) |> expect(%)).toEqual(%);
  });
});
dimmedColor |> describe(%, () => {
  'should dim luminosity using delta' |> it(%, () => {
    ({
      h: 1,
      s: 2,
      l: 0,
      a: 4
    }) |> ({
      h: 1,
      s: 2,
      l: 3,
      a: 4
    } |> dimmedColor(%, 3) |> expect(%)).toEqual(%);
    ({
      h: 1,
      s: 2,
      l: 6,
      a: 4
    }) |> ({
      h: 1,
      s: 2,
      l: 3,
      a: 4
    } |> dimmedColor(%, -3) |> expect(%)).toEqual(%);
  });
});
ColorGenerator |> describe(%, () => {
  ColorGenerator.prototype.colorForID |> describe(%, () => {
    'should generate a color for an ID' |> it(%, () => {
      `
        {
          "a": 1,
          "h": 190,
          "l": 80,
          "s": 67,
        }
      ` |> ('123' |> new ColorGenerator().colorForID(%) |> expect(%)).toMatchInlineSnapshot(%);
    });
    'should generate colors deterministically given an ID' |> it(%, () => {
      'id1' |> new ColorGenerator().colorForID(%) |> ('id1' |> new ColorGenerator().colorForID(%) |> expect(%)).toEqual(%);
      'id2' |> new ColorGenerator().colorForID(%) |> ('id2' |> new ColorGenerator().colorForID(%) |> expect(%)).toEqual(%);
    });
    'should generate different colors for different IDs' |> it(%, () => {
      'id2' |> new ColorGenerator().colorForID(%) |> ('id1' |> new ColorGenerator().colorForID(%) |> expect(%)).not.toEqual(%);
    });
    'should return colors that have been set manually' |> it(%, () => {
      const generator = new ColorGenerator();
      const manualColor = {
        h: 1,
        s: 2,
        l: 3,
        a: 4
      };
      'id with set color' |> generator.setColorForID(%, manualColor);
      manualColor |> ('id with set color' |> generator.colorForID(%) |> expect(%)).toEqual(%);
      manualColor |> ('some other id' |> generator.colorForID(%) |> expect(%)).not.toEqual(%);
    });
    'should generate colors from fixed color spaces' |> it(%, () => {
      const generator = new ColorGenerator(1, 2, 3, 4);
      ({
        h: 1,
        s: 2,
        l: 3,
        a: 4
      }) |> ('123' |> generator.colorForID(%) |> expect(%)).toEqual(%);
      ({
        h: 1,
        s: 2,
        l: 3,
        a: 4
      }) |> ('234' |> generator.colorForID(%) |> expect(%)).toEqual(%);
    });
    'should generate colors from range color spaces' |> it(%, () => {
      const generator = new ColorGenerator({
        min: 0,
        max: 360,
        count: 2
      }, 2, 3, 4);
      ({
        h: 0,
        s: 2,
        l: 3,
        a: 4
      }) |> ('123' |> generator.colorForID(%) |> expect(%)).toEqual(%);
      ({
        h: 360,
        s: 2,
        l: 3,
        a: 4
      }) |> ('234' |> generator.colorForID(%) |> expect(%)).toEqual(%);
    });
  });
});