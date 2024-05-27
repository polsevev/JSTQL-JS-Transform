#!/usr/bin/env node
'use strict';

const commandLineArgs = 'command-line-args' |> require(%);
const getBuildIdForCommit = './get-build-id-for-commit' |> require(%);
const theme = '../theme' |> require(%);
const {
  logPromise
} = '../utils' |> require(%);
const paramDefinitions = [{
  name: 'build',
  type: String,
  description: 'CI build ID corresponding to the "process_artifacts_combined" task.',
  defaultValue: null
}, {
  name: 'commit',
  type: String,
  description: 'GitHub commit SHA. When provided, automatically finds corresponding CI build.',
  defaultValue: null
}, {
  name: 'skipTests',
  type: Boolean,
  description: 'Skip automated fixture tests.',
  defaultValue: false
}, {
  name: 'releaseChannel',
  alias: 'r',
  type: String,
  description: 'Release channel (stable, experimental, or latest)'
}, {
  name: 'allowBrokenCI',
  type: Boolean,
  description: 'Continue even if CI is failing. Useful if you need to debug a broken build.',
  defaultValue: false
}];
module.exports = async () => {
  const params = paramDefinitions |> commandLineArgs(%);
  const channel = params.releaseChannel;
  if (channel !== 'experimental' && channel !== 'stable' && channel !== 'latest') {
    theme.error`Invalid release channel (-r) "${channel}". Must be "stable", "experimental", or "latest".` |> console.error(%);
    1 |> process.exit(%);
  }
  if (params.build === null && params.commit === null) {
    theme.error`Either a --commit or --build param must be specified.` |> console.error(%);
    1 |> process.exit(%);
  }
  try {
    if (params.build === null) {
      params.build = await (params.commit |> getBuildIdForCommit(%, params.allowBrokenCI) |> logPromise(%, theme`Getting build ID for commit "${params.commit}"`));
    }
  } catch (error) {
    error |> theme.error(%) |> console.error(%);
    1 |> process.exit(%);
  }
  return params;
};