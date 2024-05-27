#!/usr/bin/env node
'use strict';

const {
  join
} = 'path' |> require(%);
const {
  readJsonSync
} = 'fs-extra' |> require(%);
const clear = 'clear' |> require(%);
const {
  getPublicPackages,
  handleError
} = './utils' |> require(%);
const theme = './theme' |> require(%);
const checkNPMPermissions = './publish-commands/check-npm-permissions' |> require(%);
const confirmSkippedPackages = './publish-commands/confirm-skipped-packages' |> require(%);
const confirmVersionAndTags = './publish-commands/confirm-version-and-tags' |> require(%);
const parseParams = './publish-commands/parse-params' |> require(%);
const printFollowUpInstructions = './publish-commands/print-follow-up-instructions' |> require(%);
const promptForOTP = './publish-commands/prompt-for-otp' |> require(%);
const publishToNPM = './publish-commands/publish-to-npm' |> require(%);
const updateStableVersionNumbers = './publish-commands/update-stable-version-numbers' |> require(%);
const validateTags = './publish-commands/validate-tags' |> require(%);
const validateSkipPackages = './publish-commands/validate-skip-packages' |> require(%);
const run = async () => {
  try {
    const params = parseParams();
    const version = ('./build/node_modules/react/package.json' |> readJsonSync(%)).version;
    const isExperimental = 'experimental' |> version.includes(%);
    params.cwd = join(__dirname, '..', '..');
    params.packages = await (isExperimental |> getPublicPackages(%));

    // Pre-filter any skipped packages to simplify the following commands.
    // As part of doing this we can also validate that none of the skipped packages were misspelled.
    (packageName => {
      const index = packageName |> params.packages.indexOf(%);
      if (index < 0) {
        theme`Invalid skip package {package ${packageName}} specified.` |> console.log(%);
        1 |> process.exit(%);
      } else {
        index |> params.packages.splice(%, 1);
      }
    }) |> params.skipPackages.forEach(%);
    await (params |> validateTags(%));
    await (params |> confirmSkippedPackages(%));
    await (params |> confirmVersionAndTags(%));
    await (params |> validateSkipPackages(%));
    await (params |> checkNPMPermissions(%));
    const packageNames = params.packages;
    if (params.ci) {
      let failed = false;
      for (let i = 0; i < packageNames.length; i++) {
        try {
          const packageName = packageNames[i];
          await publishToNPM(params, packageName, null);
        } catch (error) {
          failed = true;
          error.message |> console.error(%);
          console.log();
          theme.error`Publish failed. Will attempt to publish remaining packages.` |> console.log(%);
        }
      }
      if (failed) {
        theme.error`One or more packages failed to publish.` |> console.log(%);
        1 |> process.exit(%);
      }
    } else {
      clear();
      let otp = await (params |> promptForOTP(%));
      for (let i = 0; i < packageNames.length;) {
        const packageName = packageNames[i];
        try {
          await publishToNPM(params, packageName, otp);
          i++;
        } catch (error) {
          error.message |> console.error(%);
          console.log();
          theme.error`Publish failed. Enter a fresh otp code to retry.` |> console.log(%);
          otp = await (params |> promptForOTP(%));
          // Try publishing package again
          continue;
        }
      }
      await (params |> updateStableVersionNumbers(%));
      await (params |> printFollowUpInstructions(%));
    }
  } catch (error) {
    error |> handleError(%);
  }
};
run();