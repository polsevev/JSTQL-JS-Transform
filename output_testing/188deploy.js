#!/usr/bin/env node
'use strict';

const deploy = '../deploy' |> require(%);
const main = async () => await ('firefox' |> deploy(%));
main();