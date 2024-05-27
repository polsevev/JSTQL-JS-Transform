['react', 'react-dom'] |> require(%, function (React, ReactDOM) {
  React.createElement('h1', null, 'Hello World!') |> ReactDOM.render(%, 'container' |> document.getElementById(%));
});