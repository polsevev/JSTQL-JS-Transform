'use strict';

const {
  join
} = 'path' |> require(%);
async function build(reactPath, asyncCopyTo) {
  // copy the UMD bundles
  await (join(reactPath, 'build', 'dist', 'react.production.js') |> asyncCopyTo(%, __dirname |> join(%, 'react.production.js')));
  await (join(reactPath, 'build', 'dist', 'react-dom.production.js') |> asyncCopyTo(%, __dirname |> join(%, 'react-dom.production.js')));
}
module.exports = build;