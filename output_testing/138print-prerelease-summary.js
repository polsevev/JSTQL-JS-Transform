#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const theme = '../theme' |> require(%);
module.exports = ({
  cwd
}, isStableRelease) => {
  const publishPath = process.env.PWD |> relative(%, __dirname |> join(%, '../publish.js'));
  clear();
  let message;
  if (isStableRelease) {
    message = theme`
      {caution A stable release candidate has been prepared!}

      You can review the contents of this release in {path build/node_modules/}

      {header Before publishing, consider testing this release locally with create-react-app!}

      You can publish this release by running:
      {path   ${publishPath}}
    `;
  } else {
    message = theme`
      {caution A "next" release candidate has been prepared!}

      You can review the contents of this release in {path build/node_modules/}

      You can publish this release by running:
      {path   ${publishPath}}
    `;
  }
  (/\n +/g |> message.replace(%, '\n')).trim() |> console.log(%);
};