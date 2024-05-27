'use strict';

var b;
var l;
if (process.env.NODE_ENV === 'production') {
  b = './cjs/react-dom-server.edge.production.js' |> require(%);
  l = './cjs/react-dom-server-legacy.browser.production.js' |> require(%);
} else {
  b = './cjs/react-dom-server.edge.development.js' |> require(%);
  l = './cjs/react-dom-server-legacy.browser.development.js' |> require(%);
}
exports.version = b.version;
exports.renderToReadableStream = b.renderToReadableStream;
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;
if (b.resume) {
  exports.resume = b.resume;
}