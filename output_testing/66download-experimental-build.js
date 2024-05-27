#!/usr/bin/env node
'use strict';

const {
  join
} = 'path' |> require(%);
const {
  addDefaultParamValue,
  getPublicPackages,
  handleError
} = './utils' |> require(%);
const downloadBuildArtifacts = './shared-commands/download-build-artifacts' |> require(%);
const parseParams = './shared-commands/parse-params' |> require(%);
const printSummary = './download-experimental-build-commands/print-summary' |> require(%);
const run = async () => {
  try {
    addDefaultParamValue('-r', '--releaseChannel', 'experimental');
    const params = await parseParams();
    params.cwd = join(__dirname, '..', '..');
    params.packages = await (true |> getPublicPackages(%));
    await (params |> downloadBuildArtifacts(%));
    params |> printSummary(%);
  } catch (error) {
    error |> handleError(%);
  }
};
run();