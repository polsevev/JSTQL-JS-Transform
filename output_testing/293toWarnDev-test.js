/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'toErrorDev' |> describe(%, () => {
  'does not fail if a warning contains a stack' |> it(%, () => {
    'Hello' |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.error(%);
      }
    }) |> expect(%)).toErrorDev(%);
  });
  'does not fail if all warnings contain a stack' |> it(%, () => {
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.error(%);
        'Good day\n    in div' |> console.error(%);
        'Bye\n    in div' |> console.error(%);
      }
    }) |> expect(%)).toErrorDev(%);
  });
  'does not fail if warnings without stack explicitly opt out' |> it(%, () => {
    'Hello' |> ((() => {
      if (__DEV__) {
        'Hello' |> console.error(%);
      }
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    });
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello' |> console.error(%);
        'Good day' |> console.error(%);
        'Bye' |> console.error(%);
      }
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: true
    });
  });
  'does not fail when expected stack-less warning number matches the actual one' |> it(%, () => {
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.error(%);
        'Good day' |> console.error(%);
        'Bye\n    in div' |> console.error(%);
      }
    }) |> expect(%)).toErrorDev(%, {
      withoutStack: 1
    });
  });
  if (__DEV__) {
    // Helper methods avoids invalid toWarn().toThrow() nesting
    // See no-to-warn-dev-within-to-throw
    const expectToWarnAndToThrow = (expectBlock, expectedErrorMessage) => {
      let caughtError;
      try {
        expectBlock();
      } catch (error) {
        caughtError = error;
      }
      (caughtError |> expect(%)).toBeDefined();
      expectedErrorMessage |> (caughtError.message |> expect(%)).toContain(%);
    };
    'fails if a warning does not contain a stack' |> it(%, () => {
      (() => {
        'Hello' |> ((() => {
          'Hello' |> console.error(%);
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
    });
    'fails if some warnings do not contain a stack' |> it(%, () => {
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.error(%);
          'Good day\n    in div' |> console.error(%);
          'Bye' |> console.error(%);
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello' |> console.error(%);
          'Good day\n    in div' |> console.error(%);
          'Bye\n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.error(%);
          'Good day' |> console.error(%);
          'Bye\n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello' |> console.error(%);
          'Good day' |> console.error(%);
          'Bye' |> console.error(%);
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
    });
    'fails if warning is expected to not have a stack, but does' |> it(%, () => {
      (() => {
        'Hello' |> ((() => {
          'Hello\n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly includes a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.error(%);
          'Good day' |> console.error(%);
          'Bye\n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly includes a component stack');
    });
    'fails if expected stack-less warning number does not match the actual one' |> it(%, () => {
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.error(%);
          'Good day' |> console.error(%);
          'Bye\n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: 4
        });
      }) |> expectToWarnAndToThrow(%, 'Expected 4 warnings without a component stack but received 1');
    });
    'fails if withoutStack is invalid' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: null
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received object');
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: {}
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received object');
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: 'haha'
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received string');
    });
    'fails if the argument number does not match' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          console.error('Hi %s', 'Sara', 'extra');
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received 2 arguments for a message with 1 placeholders');
      (() => {
        'Hi' |> ((() => {
          'Hi %s' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received 0 arguments for a message with 1 placeholders');
    });
    'fails if stack is passed twice' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          console.error('Hi %s%s', '\n    in div', '\n    in div');
        }) |> expect(%)).toErrorDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received more than one component stack for a warning');
    });
    'fails if multiple strings are passed without an array wrapper' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toErrorDev() second argument, when present, should be an object');
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.error(%);
          'Bye \n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toErrorDev() second argument, when present, should be an object');
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.error(%);
          'Wow \n    in div' |> console.error(%);
          'Bye \n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toErrorDev() second argument, when present, should be an object');
      (() => {
        ((() => {
          'Hi \n    in div' |> console.error(%);
          'Wow \n    in div' |> console.error(%);
          'Bye \n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev('Hi', 'Wow', 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toErrorDev() second argument, when present, should be an object');
    });
    'fails on more than two arguments' |> it(%, () => {
      (() => {
        ((() => {
          'Hi \n    in div' |> console.error(%);
          'Wow \n    in div' |> console.error(%);
          'Bye \n    in div' |> console.error(%);
        }) |> expect(%)).toErrorDev('Hi', undefined, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toErrorDev() received more than two arguments.');
    });
  }
});
'toWarnDev' |> describe(%, () => {
  'does not fail if a warning contains a stack' |> it(%, () => {
    'Hello' |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.warn(%);
      }
    }) |> expect(%)).toWarnDev(%);
  });
  'does not fail if all warnings contain a stack' |> it(%, () => {
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.warn(%);
        'Good day\n    in div' |> console.warn(%);
        'Bye\n    in div' |> console.warn(%);
      }
    }) |> expect(%)).toWarnDev(%);
  });
  'does not fail if warnings without stack explicitly opt out' |> it(%, () => {
    'Hello' |> ((() => {
      if (__DEV__) {
        'Hello' |> console.warn(%);
      }
    }) |> expect(%)).toWarnDev(%, {
      withoutStack: true
    });
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello' |> console.warn(%);
        'Good day' |> console.warn(%);
        'Bye' |> console.warn(%);
      }
    }) |> expect(%)).toWarnDev(%, {
      withoutStack: true
    });
  });
  'does not fail when expected stack-less warning number matches the actual one' |> it(%, () => {
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello\n    in div' |> console.warn(%);
        'Good day' |> console.warn(%);
        'Bye\n    in div' |> console.warn(%);
      }
    }) |> expect(%)).toWarnDev(%, {
      withoutStack: 1
    });
  });
  if (__DEV__) {
    // Helper methods avoids invalid toWarn().toThrow() nesting
    // See no-to-warn-dev-within-to-throw
    const expectToWarnAndToThrow = (expectBlock, expectedErrorMessage) => {
      let caughtError;
      try {
        expectBlock();
      } catch (error) {
        caughtError = error;
      }
      (caughtError |> expect(%)).toBeDefined();
      expectedErrorMessage |> (caughtError.message |> expect(%)).toContain(%);
    };
    'fails if a warning does not contain a stack' |> it(%, () => {
      (() => {
        'Hello' |> ((() => {
          'Hello' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
    });
    'fails if some warnings do not contain a stack' |> it(%, () => {
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.warn(%);
          'Good day\n    in div' |> console.warn(%);
          'Bye' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello' |> console.warn(%);
          'Good day\n    in div' |> console.warn(%);
          'Bye\n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.warn(%);
          'Good day' |> console.warn(%);
          'Bye\n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello' |> console.warn(%);
          'Good day' |> console.warn(%);
          'Bye' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly does not include a component stack');
    });
    'fails if warning is expected to not have a stack, but does' |> it(%, () => {
      (() => {
        'Hello' |> ((() => {
          'Hello\n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly includes a component stack');
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.warn(%);
          'Good day' |> console.warn(%);
          'Bye\n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received warning unexpectedly includes a component stack');
    });
    'fails if expected stack-less warning number does not match the actual one' |> it(%, () => {
      (() => {
        ['Hello', 'Good day', 'Bye'] |> ((() => {
          'Hello\n    in div' |> console.warn(%);
          'Good day' |> console.warn(%);
          'Bye\n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: 4
        });
      }) |> expectToWarnAndToThrow(%, 'Expected 4 warnings without a component stack but received 1');
    });
    'fails if withoutStack is invalid' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: null
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received object');
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: {}
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received object');
      (() => {
        'Hi' |> ((() => {
          'Hi' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: 'haha'
        });
      }) |> expectToWarnAndToThrow(%, 'Instead received string');
    });
    'fails if the argument number does not match' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          console.warn('Hi %s', 'Sara', 'extra');
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received 2 arguments for a message with 1 placeholders');
      (() => {
        'Hi' |> ((() => {
          'Hi %s' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, {
          withoutStack: true
        });
      }) |> expectToWarnAndToThrow(%, 'Received 0 arguments for a message with 1 placeholders');
    });
    'fails if stack is passed twice' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          console.warn('Hi %s%s', '\n    in div', '\n    in div');
        }) |> expect(%)).toWarnDev(%);
      }) |> expectToWarnAndToThrow(%, 'Received more than one component stack for a warning');
    });
    'fails if multiple strings are passed without an array wrapper' |> it(%, () => {
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toWarnDev() second argument, when present, should be an object');
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.warn(%);
          'Bye \n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toWarnDev() second argument, when present, should be an object');
      (() => {
        'Hi' |> ((() => {
          'Hi \n    in div' |> console.warn(%);
          'Wow \n    in div' |> console.warn(%);
          'Bye \n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev(%, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toWarnDev() second argument, when present, should be an object');
      (() => {
        ((() => {
          'Hi \n    in div' |> console.warn(%);
          'Wow \n    in div' |> console.warn(%);
          'Bye \n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev('Hi', 'Wow', 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toWarnDev() second argument, when present, should be an object');
    });
    'fails on more than two arguments' |> it(%, () => {
      (() => {
        ((() => {
          'Hi \n    in div' |> console.warn(%);
          'Wow \n    in div' |> console.warn(%);
          'Bye \n    in div' |> console.warn(%);
        }) |> expect(%)).toWarnDev('Hi', undefined, 'Bye');
      }) |> expectToWarnAndToThrow(%, 'toWarnDev() received more than two arguments.');
    });
  }
});
'toLogDev' |> describe(%, () => {
  'does not fail if warnings do not include a stack' |> it(%, () => {
    'Hello' |> ((() => {
      if (__DEV__) {
        'Hello' |> console.log(%);
      }
    }) |> expect(%)).toLogDev(%);
    ['Hello', 'Good day', 'Bye'] |> ((() => {
      if (__DEV__) {
        'Hello' |> console.log(%);
        'Good day' |> console.log(%);
        'Bye' |> console.log(%);
      }
    }) |> expect(%)).toLogDev(%);
  });
});