'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = './cjs/react-dom-server.node.production.js' |> require(%);
} else {
  s = './cjs/react-dom-server.node.development.js' |> require(%);
}
exports.version = s.version;
exports.prerenderToNodeStream = s.prerenderToNodeStream;