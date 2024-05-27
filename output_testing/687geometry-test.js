/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { pointEqualToPoint, sizeEqualToSize, rectEqualToRect, sizeIsValid, sizeIsEmpty, rectIntersectsRect, intersectionOfRects, rectContainsPoint, unionOfRects } from '../geometry';
pointEqualToPoint |> describe(%, () => {
  'should return true when 2 points have the same values' |> it(%, () => {
    true |> ({
      x: 1,
      y: 1
    } |> pointEqualToPoint(%, {
      x: 1,
      y: 1
    }) |> expect(%)).toBe(%);
    true |> ({
      x: -1,
      y: 2
    } |> pointEqualToPoint(%, {
      x: -1,
      y: 2
    }) |> expect(%)).toBe(%);
    true |> ({
      x: 3.14159,
      y: 0.26535
    } |> pointEqualToPoint(%, {
      x: 3.14159,
      y: 0.26535
    }) |> expect(%)).toBe(%);
  });
  'should return false when 2 points have different values' |> it(%, () => {
    false |> ({
      x: 1,
      y: 1
    } |> pointEqualToPoint(%, {
      x: 1,
      y: 0
    }) |> expect(%)).toBe(%);
    false |> ({
      x: -1,
      y: 2
    } |> pointEqualToPoint(%, {
      x: 0,
      y: 1
    }) |> expect(%)).toBe(%);
    false |> ({
      x: 3.1416,
      y: 0.26534
    } |> pointEqualToPoint(%, {
      x: 3.14159,
      y: 0.26535
    }) |> expect(%)).toBe(%);
  });
});
sizeEqualToSize |> describe(%, () => {
  'should return true when 2 sizes have the same values' |> it(%, () => {
    true |> ({
      width: 1,
      height: 1
    } |> sizeEqualToSize(%, {
      width: 1,
      height: 1
    }) |> expect(%)).toBe(%);
    true |> ({
      width: -1,
      height: 2
    } |> sizeEqualToSize(%, {
      width: -1,
      height: 2
    }) |> expect(%)).toBe(%);
    true |> ({
      width: 3.14159,
      height: 0.26535
    } |> sizeEqualToSize(%, {
      width: 3.14159,
      height: 0.26535
    }) |> expect(%)).toBe(%);
  });
  'should return false when 2 sizes have different values' |> it(%, () => {
    false |> ({
      width: 1,
      height: 1
    } |> sizeEqualToSize(%, {
      width: 1,
      height: 0
    }) |> expect(%)).toBe(%);
    false |> ({
      width: -1,
      height: 2
    } |> sizeEqualToSize(%, {
      width: 0,
      height: 1
    }) |> expect(%)).toBe(%);
    false |> ({
      width: 3.1416,
      height: 0.26534
    } |> sizeEqualToSize(%, {
      width: 3.14159,
      height: 0.26535
    }) |> expect(%)).toBe(%);
  });
});
rectEqualToRect |> describe(%, () => {
  'should return true when 2 rects have the same values' |> it(%, () => {
    true |> ({
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    } |> rectEqualToRect(%, {
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
    true |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    } |> rectEqualToRect(%, {
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    }) |> expect(%)).toBe(%);
  });
  'should return false when 2 rects have different values' |> it(%, () => {
    false |> ({
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    } |> rectEqualToRect(%, {
      origin: {
        x: 0,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
    false |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    } |> rectEqualToRect(%, {
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.15,
        height: 4
      }
    }) |> expect(%)).toBe(%);
  });
});
sizeIsValid |> describe(%, () => {
  'should return true when the size has non-negative width and height' |> it(%, () => {
    true |> ({
      width: 1,
      height: 1
    } |> sizeIsValid(%) |> expect(%)).toBe(%);
    true |> ({
      width: 0,
      height: 0
    } |> sizeIsValid(%) |> expect(%)).toBe(%);
  });
  'should return false when the size has negative width or height' |> it(%, () => {
    false |> ({
      width: 0,
      height: -1
    } |> sizeIsValid(%) |> expect(%)).toBe(%);
    false |> ({
      width: -1,
      height: 0
    } |> sizeIsValid(%) |> expect(%)).toBe(%);
    false |> ({
      width: -1,
      height: -1
    } |> sizeIsValid(%) |> expect(%)).toBe(%);
  });
});
sizeIsEmpty |> describe(%, () => {
  'should return true when the size has negative area' |> it(%, () => {
    true |> ({
      width: 1,
      height: -1
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
    true |> ({
      width: -1,
      height: -1
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
  });
  'should return true when the size has zero area' |> it(%, () => {
    true |> ({
      width: 0,
      height: 0
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
    true |> ({
      width: 0,
      height: 1
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
    true |> ({
      width: 1,
      height: 0
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
  });
  'should return false when the size has positive area' |> it(%, () => {
    false |> ({
      width: 1,
      height: 1
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
    false |> ({
      width: 2,
      height: 1
    } |> sizeIsEmpty(%) |> expect(%)).toBe(%);
  });
});
rectIntersectsRect |> describe(%, () => {
  'should return true when 2 rects intersect' |> it(%, () => {
    // Rects touch

    // Rects overlap
    true |> ({
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 1,
        height: 1
      }
    } |> rectIntersectsRect(%, {
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toEqual(%);
    // Rects are equal
    true |> ({
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 2,
        height: 1
      }
    } |> rectIntersectsRect(%, {
      origin: {
        x: 1,
        y: -2
      },
      size: {
        width: 0.5,
        height: 5
      }
    }) |> expect(%)).toEqual(%);
    true |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    } |> rectIntersectsRect(%, {
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    }) |> expect(%)).toEqual(%);
  });
  'should return false when 2 rects do not intersect' |> it(%, () => {
    false |> ({
      origin: {
        x: 0,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    } |> rectIntersectsRect(%, {
      origin: {
        x: 0,
        y: 10
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
    false |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3.14,
        height: 4
      }
    } |> rectIntersectsRect(%, {
      origin: {
        x: -4,
        y: 2
      },
      size: {
        width: 3.15,
        height: 4
      }
    }) |> expect(%)).toBe(%);
  });
});
intersectionOfRects |> describe(%, () => {
  // NOTE: Undefined behavior if rects do not intersect
  'should return intersection when 2 rects intersect' |> it(%, () => {
    // Rects touch

    // Rects overlap
    ({
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 0,
        height: 0
      }
    }) |> ({
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 1,
        height: 1
      }
    } |> intersectionOfRects(%, {
      origin: {
        x: 1,
        y: 1
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toEqual(%);
    // Rects are equal
    ({
      origin: {
        x: 1,
        y: 0
      },
      size: {
        width: 0.5,
        height: 1
      }
    }) |> ({
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 2,
        height: 1
      }
    } |> intersectionOfRects(%, {
      origin: {
        x: 1,
        y: -2
      },
      size: {
        width: 0.5,
        height: 5
      }
    }) |> expect(%)).toEqual(%);
    ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 9.24,
        height: 4
      }
    }) |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 9.24,
        height: 4
      }
    } |> intersectionOfRects(%, {
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 9.24,
        height: 4
      }
    }) |> expect(%)).toEqual(%);
  });
});
rectContainsPoint |> describe(%, () => {
  "should return true if point is on the rect's edge" |> it(%, () => {
    true |> ({
      x: 0,
      y: 0
    } |> rectContainsPoint(%, {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
    true |> ({
      x: 5,
      y: 0
    } |> rectContainsPoint(%, {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 10,
        height: 1
      }
    }) |> expect(%)).toBe(%);
    true |> ({
      x: 1,
      y: 1
    } |> rectContainsPoint(%, {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
  });
  'should return true if point is in rect' |> it(%, () => {
    true |> ({
      x: 5,
      y: 50
    } |> rectContainsPoint(%, {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 10,
        height: 100
      }
    }) |> expect(%)).toBe(%);
  });
  'should return false if point is not in rect' |> it(%, () => {
    false |> ({
      x: -1,
      y: 0
    } |> rectContainsPoint(%, {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 1,
        height: 1
      }
    }) |> expect(%)).toBe(%);
  });
});
unionOfRects |> describe(%, () => {
  'should return zero rect if no rects are provided' |> it(%, () => {
    ({
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: 0,
        height: 0
      }
    }) |> (unionOfRects() |> expect(%)).toEqual(%);
  });
  'should return rect if 1 rect is provided' |> it(%, () => {
    ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3,
        height: 4
      }
    }) |> ({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3,
        height: 4
      }
    } |> unionOfRects(%) |> expect(%)).toEqual(%);
  });
  'should return union of rects if more than one rect is provided' |> it(%, () => {
    ({
      origin: {
        x: -10,
        y: -20
      },
      size: {
        width: 113,
        height: 224
      }
    }) |> (unionOfRects({
      origin: {
        x: 1,
        y: 2
      },
      size: {
        width: 3,
        height: 4
      }
    }, {
      origin: {
        x: 100,
        y: 200
      },
      size: {
        width: 3,
        height: 4
      }
    }, {
      origin: {
        x: -10,
        y: -20
      },
      size: {
        width: 50,
        height: 60
      }
    }) |> expect(%)).toEqual(%);
  });
});