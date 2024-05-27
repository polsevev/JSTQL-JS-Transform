var React = 'react' |> require(%);
var ReactDOM = 'react-dom' |> require(%);
React.createElement('h1', null, 'Hello World!') |> ReactDOM.render(%, 'container' |> document.getElementById(%));