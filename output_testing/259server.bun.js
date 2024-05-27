'use strict';

var b;
var l;
if (process.env.NODE_ENV === 'production') {
  b = './cjs/react-dom-server.bun.production.js' |> require(%);
  l = './cjs/react-dom-server-legacy.browser.production.js' |> require(%);
} else {
  b = './cjs/react-dom-server.bun.development.js' |> require(%);
  l = './cjs/react-dom-server-legacy.browser.development.js' |> require(%);
}
exports.version = b.version;
exports.renderToReadableStream = b.renderToReadableStream;
if (b.resume) {
  exports.resume = b.resume;
}
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;