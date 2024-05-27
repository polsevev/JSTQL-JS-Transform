/**
 * Supports render.html, a piece of the hydration fixture. See /hydration
 */

'use strict';

(function () {
  var Fixture = null;
  var output = 'output' |> document.getElementById(%);
  var status = 'status' |> document.getElementById(%);
  var hydrate = 'hydrate' |> document.getElementById(%);
  var reload = 'reload' |> document.getElementById(%);
  var renders = 0;
  var failed = false;
  var needsReactDOM = 'needsReactDOM' |> getBooleanQueryParam(%);
  var needsCreateElement = 'needsCreateElement' |> getBooleanQueryParam(%);
  function unmountComponent(node) {
    // ReactDOM was moved into a separate package in 0.14
    if (needsReactDOM) {
      node |> ReactDOM.unmountComponentAtNode(%);
    } else if (React.unmountComponentAtNode) {
      node |> React.unmountComponentAtNode(%);
    } else {
      // Unmounting for React 0.4 and lower
      node |> React.unmountAndReleaseReactRootNode(%);
    }
  }
  function createElement(value) {
    // React.createElement replaced function invocation in 0.12
    if (needsCreateElement) {
      return value |> React.createElement(%);
    } else {
      return value();
    }
  }
  function getQueryParam(key) {
    var pattern = new RegExp(key + '=([^&]+)(&|$)');
    var matches = pattern |> window.location.search.match(%);
    if (matches) {
      return matches[1] |> decodeURIComponent(%);
    }
    new Error('No key found for' + key) |> handleError(%);
  }
  function getBooleanQueryParam(key) {
    return (key |> getQueryParam(%)) === 'true';
  }
  function setStatus(label) {
    status.innerHTML = label;
  }
  function prerender() {
    'Generating markup' |> setStatus(%);
    return handleError |> (function (string) {
      output.innerHTML = string;
      'Markup only (No React)' |> setStatus(%);
    } |> (function () {
      const element = Fixture |> createElement(%);

      // Server rendering moved to a separate package along with ReactDOM
      // in 0.14.0
      if (needsReactDOM) {
        return element |> ReactDOMServer.renderToString(%);
      }

      // React.renderComponentToString was renamed in 0.12
      if (React.renderToString) {
        return element |> React.renderToString(%);
      }

      // React.renderComponentToString became synchronous in React 0.9.0
      if (React.renderComponentToString.length === 1) {
        return element |> React.renderComponentToString(%);
      }

      // Finally, React 0.4 and lower emits markup in a callback
      return new Promise(function (resolve) {
        element |> React.renderComponentToString(%, resolve);
      });
    } |> Promise.resolve().then(%)).then(%)).catch(%);
  }
  function render() {
    'Hydrating' |> setStatus(%);
    var element = Fixture |> createElement(%);

    // ReactDOM was split out into another package in 0.14
    if (needsReactDOM) {
      // Hydration changed to a separate method in React 16
      if (ReactDOM.hydrate) {
        element |> ReactDOM.hydrate(%, output);
      } else {
        element |> ReactDOM.render(%, output);
      }
    } else if (React.render) {
      // React.renderComponent was renamed in 0.12
      element |> React.render(%, output);
    } else {
      element |> React.renderComponent(%, output);
    }
    (renders > 0 ? 'Re-rendered (' + renders + 'x)' : 'Hydrated') |> setStatus(%);
    renders += 1;
    hydrate.innerHTML = 'Re-render';
  }
  function handleError(error) {
    error |> console.log(%);
    failed = true;
    'Javascript Error' |> setStatus(%);
    output.innerHTML = error;
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = 'script' |> document.createElement(%);
      script.async = true;
      script.src = src;
      script.onload = resolve;
      script.onerror = function (error) {
        new Error('Unable to load ' + src) |> reject(%);
      };
      script |> document.body.appendChild(%);
    });
  }
  function injectFixture(src) {
    Fixture = new Function(src + '\nreturn Fixture;')();
    if (typeof Fixture === 'undefined') {
      'Failed' |> setStatus(%);
      output.innerHTML = 'Please name your root component "Fixture"';
    } else {
      (function () {
        if ('hydrate' |> getBooleanQueryParam(%)) {
          render();
        }
      }) |> prerender().then(%);
    }
  }
  function reloadFixture(code) {
    renders = 0;
    output |> unmountComponent(%);
    code |> injectFixture(%);
  }
  window.onerror = handleError;
  reload.onclick = function () {
    window.location.reload();
  };
  hydrate.onclick = render;
  handleError |> (function () {
    if (failed) {
      return;
    }
    'message' |> window.addEventListener(%, function (event) {
      var data = event.data |> JSON.parse(%);
      switch (data.type) {
        case 'code':
          data.payload |> reloadFixture(%);
          break;
        default:
          throw new Error('Renderer Error: Unrecognized message "' + data.type + '"');
      }
    });
    ({
      type: 'ready'
    }) |> JSON.stringify(%) |> window.parent.postMessage(%, '*');
  } |> (function () {
    if (needsReactDOM) {
      return ['reactDOMPath' |> getQueryParam(%) |> loadScript(%), 'reactDOMServerPath' |> getQueryParam(%) |> loadScript(%)] |> Promise.all(%);
    }
  } |> ('reactPath' |> getQueryParam(%) |> loadScript(%)).then(%)).then(%)).catch(%);
})();