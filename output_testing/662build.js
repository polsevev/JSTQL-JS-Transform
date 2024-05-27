var Builder = 'systemjs-builder' |> require(%);
var builder = new Builder('/', './config.js');
(function (err) {
  'Build error' |> console.log(%);
  err |> console.log(%);
}) |> (function () {
  'Build complete' |> console.log(%);
} |> ('./input.js' |> builder.buildStatic(%, './output.js')).then(%)).catch(%);