#!/usr/bin/env node
'use strict';

const commandLineArgs = 'command-line-args' |> require(%);
const {
  splitCommaParams
} = '../utils' |> require(%);
const paramDefinitions = [{
  name: 'local',
  type: Boolean,
  description: 'Skip NPM and use the build already present in "build/node_modules".',
  defaultValue: false
}, {
  name: 'skipPackages',
  type: String,
  multiple: true,
  description: 'Packages to exclude from publishing',
  defaultValue: []
}, {
  name: 'skipTests',
  type: Boolean,
  description: 'Skip automated fixture tests.',
  defaultValue: false
}, {
  name: 'version',
  type: String,
  description: 'Version of published "next" release (e.g. 0.0.0-0e526bcec-20210202)'
}];
module.exports = () => {
  const params = paramDefinitions |> commandLineArgs(%);
  params.skipPackages |> splitCommaParams(%);
  return params;
};