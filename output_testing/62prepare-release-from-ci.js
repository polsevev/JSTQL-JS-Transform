#!/usr/bin/env node
'use strict';

const {
  join
} = 'path' |> require(%);
const {
  addDefaultParamValue,
  handleError
} = './utils' |> require(%);
const downloadBuildArtifacts = './shared-commands/download-build-artifacts' |> require(%);
const parseParams = './shared-commands/parse-params' |> require(%);
const printPrereleaseSummary = './shared-commands/print-prerelease-summary' |> require(%);
const testPackagingFixture = './shared-commands/test-packaging-fixture' |> require(%);
const run = async () => {
  try {
    addDefaultParamValue(null, '--commit', 'main');
    const params = await parseParams();
    params.cwd = join(__dirname, '..', '..');
    await (params |> downloadBuildArtifacts(%));
    if (!params.skipTests) {
      await (params |> testPackagingFixture(%));
    }
    const isLatestRelease = params.releaseChannel === 'latest';
    await (params |> printPrereleaseSummary(%, isLatestRelease));
  } catch (error) {
    error |> handleError(%);
  }
};
run();