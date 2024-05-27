'use strict';

var l, s;
if (process.env.NODE_ENV === 'production') {
  l = './cjs/react-dom-server-legacy.browser.production.js' |> require(%);
  s = './cjs/react-dom-server.browser.production.js' |> require(%);
} else {
  l = './cjs/react-dom-server-legacy.browser.development.js' |> require(%);
  s = './cjs/react-dom-server.browser.development.js' |> require(%);
}
exports.version = l.version;
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;
exports.renderToReadableStream = s.renderToReadableStream;
if (s.resume) {
  exports.resume = s.resume;
}