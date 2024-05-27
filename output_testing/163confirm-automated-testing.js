#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  confirm
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async () => {
  clear();
  'This script does not run any automated tests.' + 'You should run them manually before creating a "next" release.' |> theme.caution(%) |> console.log(%);
  await ('Do you want to proceed?' |> confirm(%));
  clear();
};
module.exports = run;