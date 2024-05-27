'use strict';

var l, s;
if (process.env.NODE_ENV === 'production') {
  l = './cjs/react-dom-server-legacy.node.production.js' |> require(%);
  s = './cjs/react-dom-server.node.production.js' |> require(%);
} else {
  l = './cjs/react-dom-server-legacy.node.development.js' |> require(%);
  s = './cjs/react-dom-server.node.development.js' |> require(%);
}
exports.version = l.version;
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;
exports.renderToPipeableStream = s.renderToPipeableStream;
if (s.resumeToPipeableStream) {
  exports.resumeToPipeableStream = s.resumeToPipeableStream;
}