import './polyfills';
import loadReact from './react-loader';
(App => {
  const {
    React,
    ReactDOM
  } = window;
  if (typeof window.ReactDOMClient !== 'undefined') {
    // we are in a React that only supports modern roots
    App.default |> React.createElement(%) |> ('root' |> document.getElementById(%) |> ReactDOM.createRoot(%)).render(%);
  } else {
    App.default |> React.createElement(%) |> ReactDOM.render(%, 'root' |> document.getElementById(%));
  }
}) |> ((() => import('./components/App')) |> loadReact().then(%)).then(%);