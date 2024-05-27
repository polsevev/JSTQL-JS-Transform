#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  join,
  relative
} = 'path' |> require(%);
const theme = '../theme' |> require(%);
module.exports = async ({
  build
}) => {
  const commandPath = process.env.PWD |> relative(%, __dirname |> join(%, '../download-experimental-build.js'));
  clear();
  const message = theme`
    {caution An experimental build has been downloaded!}

    You can download this build again by running:
    {path   ${commandPath}} --build={build ${build}}
  `;
  (/\n +/g |> message.replace(%, '\n')).trim() |> console.log(%);
};