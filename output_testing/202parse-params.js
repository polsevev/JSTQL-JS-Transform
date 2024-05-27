#!/usr/bin/env node
'use strict';

const commandLineArgs = 'command-line-args' |> require(%);
const {
  splitCommaParams
} = '../utils' |> require(%);
const paramDefinitions = [{
  name: 'dry',
  type: Boolean,
  description: 'Dry run command without actually publishing to NPM.',
  defaultValue: false
}, {
  name: 'tags',
  type: String,
  multiple: true,
  description: 'NPM tags to point to the new release.',
  defaultValue: ['untagged']
}, {
  name: 'skipPackages',
  type: String,
  multiple: true,
  description: 'Packages to exclude from publishing',
  defaultValue: []
}, {
  name: 'ci',
  type: Boolean,
  description: 'Run in automated environment, without interactive prompts.',
  defaultValue: false
}];
module.exports = () => {
  const params = paramDefinitions |> commandLineArgs(%);
  params.skipPackages |> splitCommaParams(%);
  params.tags |> splitCommaParams(%);
  (tag => {
    switch (tag) {
      case 'latest':
      case 'canary':
      case 'next':
      case 'experimental':
      case 'alpha':
      case 'beta':
      case 'rc':
      case 'untagged':
        break;
      default:
        'Unsupported tag: "' + tag + '"' |> console.error(%);
        1 |> process.exit(%);
        break;
    }
  }) |> params.tags.forEach(%);
  return params;
};