#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  existsSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  getArtifactsList,
  logPromise
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  build,
  cwd,
  releaseChannel
}) => {
  const artifacts = await (build |> getArtifactsList(%));
  const buildArtifacts = (entry => 'build.tgz' |> entry.path.endsWith(%)) |> artifacts.find(%);
  if (!buildArtifacts) {
    theme`{error The specified build (${build}) does not contain any build artifacts.}` |> console.log(%);
    1 |> process.exit(%);
  }

  // Download and extract artifact
  const {
    CIRCLE_CI_API_TOKEN
  } = process.env;
  let header = '';
  // Add Circle CI API token to request header if available.
  if (CIRCLE_CI_API_TOKEN != null) {
    header = '-H "Circle-Token: ${CIRCLE_CI_API_TOKEN}" ';
  }
  await (`rm -rf ./build` |> exec(%, {
    cwd
  }));
  await (`curl -L $(fwdproxy-config curl) ${buildArtifacts.url} ${header}| tar -xvz` |> exec(%, {
    cwd
  }));

  // Copy to staging directory
  // TODO: Consider staging the release in a different directory from the CI
  // build artifacts: `./build/node_modules` -> `./staged-releases`
  if (!(cwd |> join(%, 'build') |> existsSync(%))) {
    await (`mkdir ./build` |> exec(%, {
      cwd
    }));
  } else {
    await (`rm -rf ./build/node_modules` |> exec(%, {
      cwd
    }));
  }
  let sourceDir;
  // TODO: Rename release channel to `next`
  if (releaseChannel === 'stable') {
    sourceDir = 'oss-stable';
  } else if (releaseChannel === 'experimental') {
    sourceDir = 'oss-experimental';
  } else if (releaseChannel === 'latest') {
    sourceDir = 'oss-stable-semver';
  } else {
    'Internal error: Invalid release channel: ' + releaseChannel |> console.error(%);
    releaseChannel |> process.exit(%);
  }
  await (`cp -r ./build/${sourceDir} ./build/node_modules` |> exec(%, {
    cwd
  }));
};
module.exports = async ({
  build,
  commit,
  cwd,
  releaseChannel
}) => {
  let buildLabel;
  if (commit !== null) {
    buildLabel = theme`commit {commit ${commit}} (build {build ${build}})`;
  } else {
    buildLabel = theme`build {build ${build}}`;
  }
  return {
    build,
    cwd,
    releaseChannel
  } |> run(%) |> logPromise(%, theme`Downloading artifacts from Circle CI for ${buildLabel}`);
};