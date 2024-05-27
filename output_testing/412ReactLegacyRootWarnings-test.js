let ReactDOM = 'react-dom' |> require(%);
'ReactDOMRoot' |> describe(%, () => {
  let container;
  (() => {
    jest.resetModules();
    container = 'div' |> document.createElement(%);
    ReactDOM = 'react-dom' |> require(%);
  }) |> beforeEach(%);
  // @gate !disableLegacyMode
  (() => {
    jest.restoreAllMocks();
  }) |> afterEach(%);
  'deprecation warning for ReactDOM.render' |> test(%, () => {
    console |> spyOnDev(%, 'error');
    'Hi' |> ReactDOM.render(%, container);
    'Hi' |> (container.textContent |> expect(%)).toEqual(%);
    if (__DEV__) {
      1 |> (console.error |> expect(%)).toHaveBeenCalledTimes(%);
      'ReactDOM.render has not been supported since React 18' |> (console.error.mock.calls[0][0] |> expect(%)).toContain(%);
    }
  });
});