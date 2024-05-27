'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = './cjs/react-dom-server.edge.production.js' |> require(%);
} else {
  s = './cjs/react-dom-server.edge.development.js' |> require(%);
}
exports.version = s.version;
exports.prerender = s.prerender;