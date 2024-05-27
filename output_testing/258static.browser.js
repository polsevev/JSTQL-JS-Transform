'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = './cjs/react-dom-server.browser.production.js' |> require(%);
} else {
  s = './cjs/react-dom-server.browser.development.js' |> require(%);
}
exports.version = s.version;
exports.prerender = s.prerender;