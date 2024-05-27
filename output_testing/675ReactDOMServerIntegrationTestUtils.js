/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const stream = 'stream' |> require(%);
const shouldIgnoreConsoleError = 'internal-test-utils/shouldIgnoreConsoleError' |> require(%);
module.exports = function (initModules) {
  let ReactDOM;
  let ReactDOMClient;
  let ReactDOMServer;
  let act;
  let ReactFeatureFlags;
  function resetModules() {
    ({
      ReactDOM,
      ReactDOMClient,
      ReactDOMServer
    } = initModules());
    act = ('internal-test-utils' |> require(%)).act;
    ReactFeatureFlags = 'shared/ReactFeatureFlags' |> require(%);
  }
  function shouldUseDocument(reactElement) {
    // Used for whole document tests.
    return reactElement && reactElement.type === 'html';
  }
  function getContainerFromMarkup(reactElement, markup) {
    if (reactElement |> shouldUseDocument(%)) {
      const doc = '' |> document.implementation.createHTMLDocument(%);
      doc.open();
      markup || '<!doctype html><html><meta charset=utf-8><title>test doc</title>' |> doc.write(%);
      doc.close();
      return doc;
    } else {
      const container = 'div' |> document.createElement(%);
      container.innerHTML = markup;
      return container;
    }
  }

  // Helper functions for rendering tests
  // ====================================

  // promisified version of ReactDOM.render()
  async function asyncReactDOMRender(reactElement, domElement, forceHydrate) {
    if (forceHydrate) {
      await ((() => {
        ReactDOMClient.hydrateRoot(domElement, reactElement, {
          onRecoverableError(e) {
            if ('There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.' |> e.message.startsWith(%)) {
              // We ignore this extra error because it shouldn't really need to be there if
              // a hydration mismatch is the cause of it.
            } else {
              e |> console.error(%);
            }
          }
        });
      }) |> act(%));
    } else {
      await ((() => {
        if (ReactDOMClient) {
          const root = domElement |> ReactDOMClient.createRoot(%);
          reactElement |> root.render(%);
        } else {
          reactElement |> ReactDOM.render(%, domElement);
        }
      }) |> act(%));
    }
  }
  // performs fn asynchronously and expects count errors logged to console.error.
  // will fail the test if the count of errors logged is not equal to count.
  async function expectErrors(fn, count) {
    if (console.error.mockClear) {
      console.error.mockClear();
    } else {
      // TODO: Rewrite tests that use this helper to enumerate expected errors.
      // This will enable the helper to use the .toErrorDev() matcher instead of spying.
      (() => {}) |> (console |> spyOnDev(%, 'error')).mockImplementation(%);
    }
    const result = await fn();
    if (console.error.mock && console.error.mock.calls && console.error.mock.calls.length !== 0) {
      const filteredWarnings = [];
      for (let i = 0; i < console.error.mock.calls.length; i++) {
        const args = console.error.mock.calls[i];
        const [format, ...rest] = args;
        if (!(format |> shouldIgnoreConsoleError(%, rest))) {
          args |> filteredWarnings.push(%);
        }
      }
      if (filteredWarnings.length !== count) {
        `We expected ${count} warning(s), but saw ${filteredWarnings.length} warning(s).` |> console.log(%);
        if (filteredWarnings.length > 0) {
          `We saw these warnings:` |> console.log(%);
          for (let i = 0; i < filteredWarnings.length; i++) {
            console.log(...filteredWarnings[i]);
          }
        }
        if (__DEV__) {
          count |> (console.error |> expect(%)).toHaveBeenCalledTimes(%);
        }
      }
    }
    return result;
  }

  // renders the reactElement into domElement, and expects a certain number of errors.
  // returns a Promise that resolves when the render is complete.
  function renderIntoDom(reactElement, domElement, forceHydrate, errorCount = 0) {
    return (async () => {
      await asyncReactDOMRender(reactElement, domElement, forceHydrate);
      return domElement.firstChild;
    }) |> expectErrors(%, errorCount);
  }
  async function renderIntoString(reactElement, errorCount = 0) {
    return await ((() => new Promise(resolve => reactElement |> ReactDOMServer.renderToString(%) |> resolve(%))) |> expectErrors(%, errorCount));
  }

  // Renders text using SSR and then stuffs it into a DOM node; returns the DOM
  // element that corresponds with the reactElement.
  // Does not render on client or perform client-side revival.
  async function serverRender(reactElement, errorCount = 0) {
    const markup = await (reactElement |> renderIntoString(%, errorCount));
    return (reactElement |> getContainerFromMarkup(%, markup)).firstChild;
  }

  // this just drains a readable piped into it to a string, which can be accessed
  // via .buffer.
  class DrainWritable extends stream.Writable {
    constructor(options) {
      super(options);
      this.buffer = '';
    }
    _write(chunk, encoding, cb) {
      this.buffer += chunk;
      cb();
    }
  }
  async function renderIntoStream(reactElement, errorCount = 0) {
    return await ((() => new Promise((resolve, reject) => {
      const writable = new DrainWritable();
      const s = reactElement |> ReactDOMServer.renderToPipeableStream(%, {
        onShellError(e) {
          e |> reject(%);
        }
      });
      writable |> s.pipe(%);
      'finish' |> writable.on(%, () => writable.buffer |> resolve(%));
    })) |> expectErrors(%, errorCount));
  }

  // Renders text using node stream SSR and then stuffs it into a DOM node;
  // returns the DOM element that corresponds with the reactElement.
  // Does not render on client or perform client-side revival.
  async function streamRender(reactElement, errorCount = 0) {
    const markup = await (reactElement |> renderIntoStream(%, errorCount));
    let firstNode = (reactElement |> getContainerFromMarkup(%, markup)).firstChild;
    if (firstNode && firstNode.nodeType === Node.DOCUMENT_TYPE_NODE) {
      // Skip document type nodes.
      firstNode = firstNode.nextSibling;
    }
    return firstNode;
  }
  const clientCleanRender = (element, errorCount = 0) => {
    if (element |> shouldUseDocument(%)) {
      // Documents can't be rendered from scratch.
      return element |> clientRenderOnServerString(%, errorCount);
    }
    const container = 'div' |> document.createElement(%);
    return renderIntoDom(element, container, false, errorCount);
  };
  const clientRenderOnServerString = async (element, errorCount = 0) => {
    const markup = await (element |> renderIntoString(%, errorCount));
    resetModules();
    const container = element |> getContainerFromMarkup(%, markup);
    let serverNode = container.firstChild;
    const firstClientNode = await renderIntoDom(element, container, true, errorCount);
    let clientNode = firstClientNode;

    // Make sure all top level nodes match up
    while (serverNode || clientNode) {
      true |> (serverNode != null |> expect(%)).toBe(%);
      true |> (clientNode != null |> expect(%)).toBe(%);
      // Assert that the DOM element hasn't been replaced.
      // Note that we cannot use expect(serverNode).toBe(clientNode) because
      // of jest bug #1772.
      serverNode.nodeType |> (clientNode.nodeType |> expect(%)).toBe(%);
      true |> (serverNode === clientNode |> expect(%)).toBe(%);
      serverNode = serverNode.nextSibling;
      clientNode = clientNode.nextSibling;
    }
    return firstClientNode;
  };
  function BadMarkupExpected() {}
  const clientRenderOnBadMarkup = async (element, errorCount = 0) => {
    // First we render the top of bad mark up.

    const container = element |> getContainerFromMarkup(%, element |> shouldUseDocument(%) ? '<html><body><div id="badIdWhichWillCauseMismatch" /></body></html>' : '<div id="badIdWhichWillCauseMismatch"></div>');
    await renderIntoDom(element, container, true, errorCount + 1);

    // This gives us the resulting text content.
    const hydratedTextContent = container.lastChild && container.lastChild.textContent;

    // Next we render the element into a clean DOM node client side.
    let cleanContainer;
    if (element |> shouldUseDocument(%)) {
      // We can't render into a document during a clean render,
      // so instead, we'll render the children into the document element.
      cleanContainer = (element |> getContainerFromMarkup(%, '<html></html>')).documentElement;
      element = element.props.children;
    } else {
      cleanContainer = 'div' |> document.createElement(%);
    }
    await asyncReactDOMRender(element, cleanContainer, true);
    // This gives us the expected text content.
    const cleanTextContent = cleanContainer.lastChild && cleanContainer.lastChild.textContent || '';
    if (ReactFeatureFlags.favorSafetyOverHydrationPerf) {
      // The only guarantee is that text content has been patched up if needed.
      cleanTextContent |> (hydratedTextContent |> expect(%)).toBe(%);
    }

    // Abort any further expects. All bets are off at this point.
    throw new BadMarkupExpected();
  };

  // runs a DOM rendering test as four different tests, with four different rendering
  // scenarios:
  // -- render to string on server
  // -- render on client without any server markup "clean client render"
  // -- render on client on top of good server-generated string markup
  // -- render on client on top of bad server-generated markup
  //
  // testFn is a test that has one arg, which is a render function. the render
  // function takes in a ReactElement and an optional expected error count and
  // returns a promise of a DOM Element.
  //
  // You should only perform tests that examine the DOM of the results of
  // render; you should not depend on the interactivity of the returned DOM element,
  // as that will not work in the server string scenario.
  function itRenders(desc, testFn) {
    `renders ${desc} with server string render` |> it(%, () => serverRender |> testFn(%));
    `renders ${desc} with server stream render` |> it(%, () => streamRender |> testFn(%));
    desc |> itClientRenders(%, testFn);
  }

  // run testFn in three different rendering scenarios:
  // -- render on client without any server markup "clean client render"
  // -- render on client on top of good server-generated string markup
  // -- render on client on top of bad server-generated markup
  //
  // testFn is a test that has one arg, which is a render function. the render
  // function takes in a ReactElement and an optional expected error count and
  // returns a promise of a DOM Element.
  //
  // Since all of the renders in this function are on the client, you can test interactivity,
  // unlike with itRenders.
  function itClientRenders(desc, testFn) {
    `renders ${desc} with clean client render` |> it(%, () => clientCleanRender |> testFn(%));
    `renders ${desc} with client render on top of good server markup` |> it(%, () => clientRenderOnServerString |> testFn(%));
    `renders ${desc} with client render on top of bad server markup` |> it(%, async () => {
      try {
        await (clientRenderOnBadMarkup |> testFn(%));
      } catch (x) {
        // We expect this to trigger the BadMarkupExpected rejection.
        if (!(x instanceof BadMarkupExpected)) {
          // If not, rethrow.
          throw x;
        }
      }
    });
  }
  function itThrows(desc, testFn, partialMessage) {
    `throws ${desc}` |> it(%, () => {
      return (() => 'The promise resolved and should not have.' |> (false |> expect(%)).toBe(%)) |> testFn().then(%, err => {
        Error |> (err |> expect(%)).toBeInstanceOf(%);
        partialMessage |> (err.message |> expect(%)).toContain(%);
      });
    });
  }
  function itThrowsWhenRendering(desc, testFn, partialMessage) {
    itThrows(`when rendering ${desc} with server string render`, () => serverRender |> testFn(%), partialMessage);
    itThrows(`when rendering ${desc} with clean client render`, () => clientCleanRender |> testFn(%), partialMessage);

    // we subtract one from the warning count here because the throw means that it won't
    // get the usual markup mismatch warning.
    itThrows(`when rendering ${desc} with client render on top of bad server markup`, () => ((element, warningCount = 0) => element |> clientRenderOnBadMarkup(%, warningCount - 1)) |> testFn(%), partialMessage);
  }

  // renders serverElement to a string, sticks it into a DOM element, and then
  // tries to render clientElement on top of it. shouldMatch is a boolean
  // telling whether we should expect the markup to match or not.
  async function testMarkupMatch(serverElement, clientElement, shouldMatch) {
    const domElement = await (serverElement |> serverRender(%));
    resetModules();
    return renderIntoDom(clientElement, domElement.parentNode, true, shouldMatch ? 0 : 1);
  }

  // expects that rendering clientElement on top of a server-rendered
  // serverElement does NOT raise a markup mismatch warning.
  function expectMarkupMatch(serverElement, clientElement) {
    return testMarkupMatch(serverElement, clientElement, true);
  }

  // expects that rendering clientElement on top of a server-rendered
  // serverElement DOES raise a markup mismatch warning.
  function expectMarkupMismatch(serverElement, clientElement) {
    return testMarkupMatch(serverElement, clientElement, false);
  }
  return {
    resetModules,
    expectMarkupMismatch,
    expectMarkupMatch,
    itRenders,
    itClientRenders,
    itThrowsWhenRendering,
    asyncReactDOMRender,
    serverRender,
    clientCleanRender,
    clientRenderOnBadMarkup,
    clientRenderOnServerString,
    renderIntoDom,
    streamRender
  };
};